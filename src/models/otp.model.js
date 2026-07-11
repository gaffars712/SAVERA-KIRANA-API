const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const OtpSchema = mongoose.Schema(
  {
    // one of email/phone will be set depending on the channel
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    otp: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['login', 'phoneVerify', 'emailVerify'],
      default: 'login',
    },
    attempts: { type: Number, default: 0 },
    expiresAt: {
      type: Date,
      required: true,
      // TTL index — Mongo auto-deletes expired docs
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

OtpSchema.plugin(toJSON);

const OTP = mongoose.model('otps', OtpSchema);
module.exports = OTP;
