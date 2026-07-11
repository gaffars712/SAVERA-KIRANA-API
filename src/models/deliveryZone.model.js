const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const slotSchema = new mongoose.Schema(
  {
    label: { type: String, required: true }, // "8 - 10 AM"
    start: { type: String, required: true }, // "08:00"
    end: { type: String, required: true },   // "10:00"
    capacity: { type: Number, default: 100 },
    activeDays: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    pincodes: [{ type: String, index: true }],
    deliveryFee: { type: Number, default: 20 },
    minCartValue: { type: Number, default: 99 },
    freeDeliveryThreshold: { type: Number, default: 499 },
    slots: [slotSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

deliveryZoneSchema.plugin(toJSON);

deliveryZoneSchema.statics.findByPincode = function (pincode) {
  return this.findOne({ pincodes: pincode, isActive: true });
};

const DeliveryZone = mongoose.model('deliveryZones', deliveryZoneSchema);
module.exports = DeliveryZone;
