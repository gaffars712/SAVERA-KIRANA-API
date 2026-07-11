const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    type: {
      type: String,
      enum: ['flat', 'percent', 'free_delivery'],
      required: true,
    },
    value: { type: Number, default: 0 }, // amount for flat, percent for percent
    cap: { type: Number, default: 0 }, // max discount for percent type
    minCart: { type: Number, default: 0 },

    // Applicability
    applicableOn: { type: String, enum: ['all', 'category', 'brand', 'product'], default: 'all' },
    applicableRefs: [{ type: mongoose.Schema.Types.Mixed }], // category / brand / product ids

    userType: { type: String, enum: ['all', 'new', 'existing'], default: 'all' },

    usageLimitTotal: { type: Number, default: 0 }, // 0 = unlimited
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },

    validFrom: { type: Date },
    validTo: { type: Date },

    stackable: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.plugin(toJSON);

const Coupon = mongoose.model('coupons', couponSchema);
module.exports = Coupon;
