const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const variant = Joi.object({
  sku: Joi.string().max(60),
  unit: Joi.string().valid('g', 'kg', 'ml', 'l', 'pcs', 'pack', 'dozen').required(),
  value: Joi.number().min(0).required(),
  label: Joi.string().allow(''),
  mrp: Joi.number().min(0).required(),
  sellingPrice: Joi.number().min(0).required(),
  costPrice: Joi.number().min(0),
  stock: Joi.number().min(0),
  lowStockThreshold: Joi.number().min(0),
  minOrderQty: Joi.number().integer().min(1),
  maxOrderQty: Joi.number().integer().min(1),
  stepQty: Joi.number().integer().min(1),
  barcode: Joi.string().allow(''),
  weightGrams: Joi.number().min(0),
  isDefault: Joi.boolean(),
  isActive: Joi.boolean(),
});

const image = Joi.object({
  url: Joi.string().uri().required(),
  publicId: Joi.string().allow(''),
  alt: Joi.string().allow(''),
});

const create = {
  body: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().allow('').max(5000),
    shortDescription: Joi.string().allow('').max(200),
    brand: objectId,
    category: objectId.required(),
    isVeg: Joi.boolean(),
    hsnCode: Joi.string().allow(''),
    fssaiLicense: Joi.string().allow(''),
    gstSlab: Joi.number().valid(0, 5, 12, 18, 28),
    manufacturer: Joi.string().allow(''),
    countryOfOrigin: Joi.string().allow(''),
    shelfLifeDays: Joi.number().min(0),
    ingredients: Joi.string().allow(''),
    nutrition: Joi.object(),
    images: Joi.array().items(image),
    variants: Joi.array().items(variant).min(1).required(),
    highlights: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string().valid('draft', 'published', 'archived'),
    isFeatured: Joi.boolean(),
    isBestseller: Joi.boolean(),
    seo: Joi.object({
      title: Joi.string().allow(''),
      description: Joi.string().allow(''),
      keywords: Joi.array().items(Joi.string()),
    }),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: create.body.fork(['name', 'category', 'variants'], (s) => s.optional()).min(1),
};

const list = {
  query: Joi.object({
    q: Joi.string().allow(''),
    category: Joi.string(),
    brand: Joi.string(),
    veg: Joi.boolean(),
    featured: Joi.boolean(),
    bestseller: Joi.boolean(),
    minPrice: Joi.number(),
    maxPrice: Joi.number(),
    status: Joi.string().valid('draft', 'published', 'archived'),
    sort: Joi.string().valid('price_asc', 'price_desc', 'popular', 'rating', 'newest'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(60),
  }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };
const bySlug = { params: Joi.object({ slug: Joi.string().required() }) };

module.exports = { create, update, list, byId, bySlug };
