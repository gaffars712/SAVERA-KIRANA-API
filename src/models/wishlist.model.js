const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const wishlistItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true,
      index: true,
    },
    items: [wishlistItemSchema],
  },
  { timestamps: true }
);

wishlistSchema.plugin(toJSON);

const Wishlist = mongoose.model('wishlists', wishlistSchema);
module.exports = Wishlist;
