const httpStatus = require('http-status');
const { Wishlist, Product } = require('../../models');
const ApiError = require('../../utils/ApiError');

const getOrCreate = async (userId) => {
  let w = await Wishlist.findOne({ user: userId });
  if (!w) w = await Wishlist.create({ user: userId, items: [] });
  return w;
};

const get = async (userId) => {
  const w = await getOrCreate(userId);
  const populated = await Wishlist.findById(w._id).populate({
    path: 'items.product',
    select: 'name slug images variants brand category isVeg ratingAvg ratingCount status',
    populate: [
      { path: 'brand', select: 'name slug' },
      { path: 'category', select: 'name slug' },
    ],
  });
  const items = (populated.items || [])
    .filter((i) => i.product && i.product.status === 'published')
    .map((i) => ({ id: i._id, addedAt: i.addedAt, product: i.product }));
  return { items };
};

const add = async (userId, productId) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  const w = await getOrCreate(userId);
  const exists = w.items.some((i) => String(i.product) === String(productId));
  if (!exists) {
    w.items.unshift({ product: productId });
    await w.save();
  }
  return get(userId);
};

const remove = async (userId, productId) => {
  const w = await getOrCreate(userId);
  w.items = w.items.filter((i) => String(i.product) !== String(productId));
  await w.save();
  return get(userId);
};

const toggle = async (userId, productId) => {
  const w = await getOrCreate(userId);
  const idx = w.items.findIndex((i) => String(i.product) === String(productId));
  if (idx === -1) {
    w.items.unshift({ product: productId });
  } else {
    w.items.splice(idx, 1);
  }
  await w.save();
  return get(userId);
};

module.exports = { get, add, remove, toggle };
