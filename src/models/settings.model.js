const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const openHoursSchema = new mongoose.Schema(
  {
    mon: { open: String, close: String, closed: { type: Boolean, default: false } },
    tue: { open: String, close: String, closed: { type: Boolean, default: false } },
    wed: { open: String, close: String, closed: { type: Boolean, default: false } },
    thu: { open: String, close: String, closed: { type: Boolean, default: false } },
    fri: { open: String, close: String, closed: { type: Boolean, default: false } },
    sat: { open: String, close: String, closed: { type: Boolean, default: false } },
    sun: { open: String, close: String, closed: { type: Boolean, default: false } },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true, index: true },

    store: {
      name: { type: String, default: 'Savera Kirana' },
      tagline: { type: String, default: 'Fresh groceries at your doorstep' },
      gstin: { type: String, default: '' },
      fssai: { type: String, default: '' },
      address: {
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        pincode: { type: String, default: '' },
      },
      location: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
      logoUrl: { type: String, default: '' },
      photos: [{ type: String }],
      openHours: openHoursSchema,
    },

    fulfillment: {
      mode: {
        type: String,
        enum: ['delivery', 'pickup', 'both'],
        default: 'both',
      },
      pickupPrepTime: { type: Number, default: 30 },
      pickupInstructions: {
        type: String,
        default: 'Show your 4-digit pickup code at the counter to collect your order.',
      },
      pickupCodeLength: { type: Number, enum: [4, 6], default: 4 },
      autoNotifyOnReady: { type: Boolean, default: true },
      allowManualCall: { type: Boolean, default: true },
      notifyChannels: {
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        whatsapp: { type: Boolean, default: false },
      },
    },

    delivery: {
      defaultFee: { type: Number, default: 20 },
      freeDeliveryThreshold: { type: Number, default: 499 },
      packagingFee: { type: Number, default: 0 },
      handlingFee: { type: Number, default: 0 },
      minCartValue: { type: Number, default: 99 },
    },

    payment: {
      codEnabled: { type: Boolean, default: true },
      codLimit: { type: Number, default: 2000 },
      razorpayEnabled: { type: Boolean, default: true },
      walletEnabled: { type: Boolean, default: true },
    },

    tax: {
      defaultGstSlab: { type: Number, default: 5 },
      pricesIncludeGst: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

settingsSchema.plugin(toJSON);

settingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne({ key: 'global' });
  if (!doc) doc = await this.create({ key: 'global' });
  return doc;
};

const Settings = mongoose.model('settings', settingsSchema);
module.exports = Settings;
