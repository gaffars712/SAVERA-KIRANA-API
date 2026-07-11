const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '' },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
      default: null,
      index: true,
    },
    ancestors: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
        name: String,
        slug: String,
      },
    ],
    imageUrl: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    iconUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.index({ name: 'text', description: 'text' });
categorySchema.plugin(toJSON);

const Category = mongoose.model('categories', categorySchema);
module.exports = Category;
