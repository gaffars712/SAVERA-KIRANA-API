const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { toJSON } = require('./plugins');

const riderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    passwordHash: { type: String, select: false }, // future rider app
    photo: { type: String, default: '' },

    vehicle: { type: String, default: '' },
    vehicleType: { type: String, enum: ['bike', 'scooter', 'cycle', 'foot'], default: 'bike' },

    zones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'deliveryZones' }],

    documents: {
      aadhaarUrl: String,
      dlUrl: String,
      panUrl: String,
    },

    bank: {
      accountName: String,
      accountNumber: String,
      ifsc: String,
    },

    status: { type: String, enum: ['online', 'delivering', 'break', 'offline'], default: 'offline', index: true },
    lastKnownLocation: {
      lat: Number,
      lng: Number,
      at: Date,
    },

    rating: { type: Number, default: 5, min: 0, max: 5 },
    todaysDeliveries: { type: Number, default: 0 },
    lifetimeDeliveries: { type: Number, default: 0 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

riderSchema.plugin(toJSON);

riderSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$2a')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

const Rider = mongoose.model('riders', riderSchema);
module.exports = Rider;
