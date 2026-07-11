const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const { CUSTOMER } = require('../config/roles');
const counterIncrementor = require('../utils/counterIncrementer');

/**
 * Customer model. Customer login is OTP-based on phone.
 * Admins live in a separate `admins` collection.
 */
const userSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, default: '' },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      validate(value) {
        if (value && !validator.isEmail(value)) throw new Error('Invalid email');
      },
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      default: CUSTOMER,
      enum: [CUSTOMER],
    },
    isPhoneVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: String, default: null },
    walletBalance: { type: Number, default: 0 },
    defaultAddress: { type: mongoose.SchemaTypes.ObjectId, ref: 'addresses' },
    fcmTokens: [{ type: String }],
    seqId: { type: Number },
    active: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.plugin(toJSON);
userSchema.plugin(paginate);

userSchema.statics.isPhoneTaken = async function (phone, excludeUserId) {
  const user = await this.findOne({ phone, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.pre('save', async function (next) {
  if (this.isNew && !this.seqId) {
    this.seqId = await counterIncrementor('user');
  }
  if (this.isNew && !this.referralCode) {
    this.referralCode = 'SK' + Math.random().toString(36).slice(2, 8).toUpperCase();
  }
  next();
});

const User = mongoose.model('users', userSchema);

module.exports = User;
