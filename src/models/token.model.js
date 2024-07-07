const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const { tokenTypes } = require('../config/tokens');
const counterIncrementor = require('../utils/counterIncrementer');

const tokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.REFRESH, tokenTypes.RESET_PASSWORD, tokenTypes.VERIFY_EMAIL, tokenTypes.LOGIN_VERIFY, tokenTypes.PHONE_NUMBER_CHANGE,tokenTypes.EDITION_PAYMENT, tokenTypes.PROFILE_INVITE, tokenTypes.SIGN_PROFILE_INVITE, tokenTypes.SOCIAL_LOGIN],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
    seqId: {
      type: Number
    },

  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

tokenSchema.pre('save', async function (next) {
  const doc = this;
  doc.seqId = await counterIncrementor('Token')
  next();
});

tokenSchema.methods.removeToken = async function () {
  return this.deleteOne();
};


/**
 * @typedef Token
 */
const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
