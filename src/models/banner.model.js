const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: '' },
    mobileImageUrl: { type: String, default: '' },
    mobileImagePublicId: { type: String, default: '' },

    // Where to render it
    position: {
      type: String,
      enum: ['home_hero', 'home_strip', 'category_top', 'cart_strip', 'checkout'],
      default: 'home_hero',
      index: true,
    },

    // What tapping the banner does
    linkType: {
      type: String,
      enum: ['category', 'product', 'url', 'none'],
      default: 'none',
    },
    linkRef: { type: mongoose.Schema.Types.ObjectId }, // category or product id
    linkUrl: { type: String, default: '' },

    ctaText: { type: String, default: 'Shop now' },
    backgroundColor: { type: String, default: '' },

    order: { type: Number, default: 0 },
    startsAt: { type: Date },
    endsAt: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bannerSchema.plugin(toJSON);

bannerSchema.statics.getActive = function (position) {
  const now = new Date();
  const q = {
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ endsAt: { $exists: false } }, { endsAt: null }, { endsAt: { $gte: now } }] },
    ],
  };
  if (position) q.position = position;
  return this.find(q).sort({ order: 1, createdAt: -1 });
};

const Banner = mongoose.model('banners', bannerSchema);
module.exports = Banner;
