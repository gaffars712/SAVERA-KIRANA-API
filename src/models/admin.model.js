const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { adminRoles, SUPER_ADMIN } = require('../config/roles');

const adminSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) throw new Error('Invalid email');
      },
    },
    phone: { type: String, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 6,
      trim: true,
      private: true,
      select: false,
    },
    role: {
      type: String,
      enum: adminRoles,
      required: true,
      default: SUPER_ADMIN,
    },
    avatarUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.SchemaTypes.ObjectId, ref: 'admins' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

adminSchema.plugin(toJSON);
adminSchema.plugin(paginate);

adminSchema.statics.isEmailTaken = async function (email, excludeAdminId) {
  const admin = await this.findOne({ email, _id: { $ne: excludeAdminId } });
  return !!admin;
};

adminSchema.methods.isPasswordMatch = async function (password) {
  return bcrypt.compare(password, this.password);
};

adminSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const Admin = mongoose.model('admins', adminSchema);

module.exports = Admin;
