const httpStatus = require('http-status');
const mongoose = require('mongoose');
const slugify = require('slugify');
const { Product, Category, Brand } = require('../../models');
const ApiError = require('../../utils/ApiError');

const uniqueSlug = async (name, excludeId) => {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Product.exists({ slug, _id: { $ne: excludeId } })) slug = `${base}-${i++}`;
  return slug;
};

const buildCategoryPath = async (categoryId) => {
  if (!categoryId) return [];
  const cat = await Category.findById(categoryId);
  if (!cat) throw new ApiError(httpStatus.BAD_REQUEST, 'Category not found');
  return [...cat.ancestors.map((a) => a._id), cat._id];
};

const ensureVariants = (variants) => {
  if (!variants || !variants.length) throw new ApiError(httpStatus.BAD_REQUEST, 'At least one variant is required');
  const defaults = variants.filter((v) => v.isDefault);
  if (defaults.length === 0) variants[0].isDefault = true;
  else if (defaults.length > 1) {
    variants.forEach((v, i) => { v.isDefault = i === variants.findIndex((x) => x.isDefault); });
  }
  return variants;
};

const create = async (data) => {
  const slug = await uniqueSlug(data.name);
  const categoryPath = await buildCategoryPath(data.category);
  const variants = ensureVariants(data.variants);
  const doc = await Product.create({
    ...data,
    slug,
    categoryPath,
    variants,
    publishedAt: data.status === 'published' ? new Date() : undefined,
  });
  await Category.updateOne({ _id: data.category }, { $inc: { productCount: 1 } });
  return doc.populate(['brand', 'category']);
};

const update = async (id, data) => {
  const p = await Product.findById(id);
  if (!p) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  if (data.name && data.name !== p.name) p.slug = await uniqueSlug(data.name, id);
  if (data.category && String(data.category) !== String(p.category)) {
    await Category.updateOne({ _id: p.category }, { $inc: { productCount: -1 } });
    await Category.updateOne({ _id: data.category }, { $inc: { productCount: 1 } });
    p.categoryPath = await buildCategoryPath(data.category);
  }
  if (data.variants) data.variants = ensureVariants(data.variants);
  if (data.status === 'published' && p.status !== 'published') p.publishedAt = new Date();

  Object.assign(p, data);
  await p.save();
  return p.populate(['brand', 'category']);
};

const remove = async (id) => {
  const p = await Product.findById(id);
  if (!p) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  await Category.updateOne({ _id: p.category }, { $inc: { productCount: -1 } });
  await p.deleteOne();
  return { deleted: true };
};

const getById = async (id) => {
  const p = await Product.findById(id).populate(['brand', 'category']);
  if (!p) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return p;
};

const getBySlug = async (slug) => {
  const p = await Product.findOne({ slug }).populate(['brand', 'category']);
  if (!p) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  return p;
};

/**
 * Search + filters. Used by both admin & public.
 * Filters: q, category (id or slug), brand (id or slug), veg, minPrice, maxPrice,
 * discount, sort, status (admin only), page, limit.
 */
const search = async (filter = {}, { isPublic = false } = {}) => {
  const page = Math.max(1, parseInt(filter.page, 10) || 1);
  const limit = Math.min(60, parseInt(filter.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const q = {};

  if (isPublic) q.status = 'published';
  else if (filter.status) q.status = filter.status;

  if (filter.q) q.$text = { $search: filter.q };

  if (filter.category) {
    if (mongoose.isValidObjectId(filter.category)) {
      q.$or = [{ category: filter.category }, { categoryPath: filter.category }];
    } else {
      const cat = await Category.findOne({ slug: filter.category });
      if (cat) q.$or = [{ category: cat._id }, { categoryPath: cat._id }];
      else return { items: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  if (filter.brand) {
    if (mongoose.isValidObjectId(filter.brand)) q.brand = filter.brand;
    else {
      const br = await Brand.findOne({ slug: filter.brand });
      if (br) q.brand = br._id;
    }
  }

  if (filter.veg === 'true' || filter.veg === true) q.isVeg = true;

  if (filter.featured) q.isFeatured = true;
  if (filter.bestseller) q.isBestseller = true;

  // Price range on any variant's sellingPrice
  const priceMatch = {};
  if (filter.minPrice) priceMatch.$gte = Number(filter.minPrice);
  if (filter.maxPrice) priceMatch.$lte = Number(filter.maxPrice);
  if (Object.keys(priceMatch).length) q['variants.sellingPrice'] = priceMatch;

  // Sort
  let sort = { createdAt: -1 };
  switch (filter.sort) {
    case 'price_asc': sort = { 'variants.sellingPrice': 1 }; break;
    case 'price_desc': sort = { 'variants.sellingPrice': -1 }; break;
    case 'popular': sort = { salesCount: -1 }; break;
    case 'rating': sort = { ratingAvg: -1 }; break;
    case 'newest': sort = { createdAt: -1 }; break;
    default: break;
  }

  const [items, total] = await Promise.all([
    Product.find(q).populate('brand', 'name slug logoUrl').populate('category', 'name slug').sort(sort).skip(skip).limit(limit),
    Product.countDocuments(q),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

/**
 * Enforce grocery quantity rules — used by cart/order services in P3.
 * Given { variantId, qty }, returns clamped qty and any warnings.
 */
const enforceQtyRules = (variant, qty) => {
  if (!variant || !variant.isActive) return { ok: false, reason: 'Variant not available' };
  if (qty < variant.minOrderQty) return { ok: false, reason: `Minimum ${variant.minOrderQty} required` };
  if (qty > variant.maxOrderQty) return { ok: false, reason: `Maximum ${variant.maxOrderQty} allowed` };
  if (variant.stepQty && qty % variant.stepQty !== 0)
    return { ok: false, reason: `Quantity must be in steps of ${variant.stepQty}` };
  if (qty > variant.stock) return { ok: false, reason: 'Insufficient stock' };
  return { ok: true, qty };
};

module.exports = {
  create,
  update,
  remove,
  getById,
  getBySlug,
  search,
  enforceQtyRules,
};
