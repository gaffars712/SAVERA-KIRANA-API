const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('./plugins');
const { roles } = require('../config/roles');
const counterIncrementor = require('../utils/counterIncrementer');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    phone: {
      type: String,
      trim: true,
      minlength: 10,
      maxlength: 10,
      required: false,
    },
    userLocation : {
      type: Object,
    },
    accessRole: {
      type: String,
      enum: roles,
      required: true,
      default: 'user',
    },
    isEmailVerified : {
			type: Boolean,
			default: false
		},
    isFacebookUser : {
			type: Boolean,
			default: false
		},
    seqId: {
      type: Number
    },
    active: {
      type: Boolean,
      default: true
    },
    isGoogleUser: {
      type: Boolean,
      default: false
    },
    isServiceProvider: {
      type: Boolean,
      default: false
    },
    serviceProviderId: {
      type: mongoose.SchemaTypes.ObjectId,
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.pre('save', async function (next) {
  const user = this;
  user.seqId = user.accessRole ? await counterIncrementor('user') : await counterIncrementor(user.accessRole);
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('users', userSchema);

module.exports = User;
