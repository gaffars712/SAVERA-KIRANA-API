const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const waitlistSchema = new mongoose.Schema(
  {
    email: { type: String, lowercase: true, trim: true },
    pincode: { type: String, required: true, index: true },
    phone: { type: String, trim: true },
    source: { type: String, default: 'splash' },
    notified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

waitlistSchema.plugin(toJSON);
waitlistSchema.index({ pincode: 1, email: 1 }, { unique: true, sparse: true });

const Waitlist = mongoose.model('waitlists', waitlistSchema);
module.exports = Waitlist;
