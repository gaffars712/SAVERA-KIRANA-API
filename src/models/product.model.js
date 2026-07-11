const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  { _id: false }
);

/**
 * Variant = a specific size/pack of a product.
 * e.g. Aashirvaad Atta comes in 500g / 1kg / 5kg / 10kg — 4 variants.
 * Prices, stock, and min-order rules are per-variant.
 */
const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true, index: true, unique: true, sparse: true },
    unit: {
      type: String,
      enum: ['g', 'kg', 'ml', 'l', 'pcs', 'pack', 'dozen'],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    label: { type: String, default: '' }, // computed like "500g" or "1kg"
    mrp: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },

    // Grocery-critical rules
    minOrderQty: { type: Number, default: 1, min: 1 },
    maxOrderQty: { type: Number, default: 20, min: 1 },
    stepQty: { type: Number, default: 1, min: 1 },

    barcode: { type: String, default: '' },
    weightGrams: { type: Number, default: 0 }, // for delivery weight calc
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { _id: true, timestamps: false }
);

variantSchema.virtual('discountPercent').get(function () {
  if (!this.mrp || this.mrp <= this.sellingPrice) return 0;
  return Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
});

variantSchema.pre('validate', function (next) {
  if (!this.label) this.label = `${this.value}${this.unit}`;
  if (this.sellingPrice > this.mrp) return next(new Error('sellingPrice cannot exceed mrp'));
  next();
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: 'text' },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    shortDescription: { type: String, default: '', maxlength: 200 },

    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'brands', index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true, index: true },
    categoryPath: [{ type: mongoose.Schema.Types.ObjectId, ref: 'categories' }],

    isVeg: { type: Boolean, default: true },

    // Grocery / FSSAI
    hsnCode: { type: String, default: '' },
    fssaiLicense: { type: String, default: '' },
    gstSlab: { type: Number, enum: [0, 5, 12, 18, 28], default: 5 },
    manufacturer: { type: String, default: '' },
    countryOfOrigin: { type: String, default: 'India' },
    shelfLifeDays: { type: Number, default: 0 },
    ingredients: { type: String, default: '' },
    nutrition: { type: mongoose.Schema.Types.Mixed, default: {} },

    images: { type: [imageSchema], default: [] },
    variants: {
      type: [variantSchema],
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    highlights: [{ type: String }],

    tags: [{ type: String, lowercase: true, trim: true }],

    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    salesCount: { type: Number, default: 0 },

    // Publishing
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    publishedAt: { type: Date },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },

    // SEO
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: [{ type: String }],
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ brand: 1, status: 1 });

productSchema.virtual('startingPrice').get(function () {
  if (!this.variants?.length) return 0;
  return Math.min(...this.variants.filter((v) => v.isActive).map((v) => v.sellingPrice));
});

productSchema.virtual('inStock').get(function () {
  return (this.variants || []).some((v) => v.isActive && v.stock > 0);
});

productSchema.plugin(toJSON);

const Product = mongoose.model('products', productSchema);
module.exports = Product;
