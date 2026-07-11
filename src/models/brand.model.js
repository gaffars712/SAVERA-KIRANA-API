const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    logoUrl: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    description: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

brandSchema.plugin(toJSON);
brandSchema.index({ name: 'text' });

const Brand = mongoose.model('brands', brandSchema);
module.exports = Brand;
