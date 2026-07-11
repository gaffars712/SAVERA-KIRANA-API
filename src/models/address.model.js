const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    tag: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '' },
    landmark: { type: String, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, index: true },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

addressSchema.plugin(toJSON);

// Ensure only one default per user
addressSchema.pre('save', async function (next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Address = mongoose.model('addresses', addressSchema);
module.exports = Address;
