const Joi = require('joi');

const phone = Joi.string()
  .pattern(/^\+?[0-9]{10,15}$/)
  .messages({ 'string.pattern.base': 'Phone must be 10-15 digits, optional leading +' });

const email = Joi.string().email().required();

const requestOtp = { body: Joi.object({ phone: phone.required() }) };

const verifyOtp = {
  body: Joi.object({
    phone: phone.required(),
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    name: Joi.string().max(80).optional().allow(''),
  }),
};

const requestEmailOtp = { body: Joi.object({ email }) };

const verifyEmailOtp = {
  body: Joi.object({
    email,
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    name: Joi.string().max(80).optional().allow(''),
  }),
};

const updateProfile = {
  body: Joi.object({
    name: Joi.string().max(80).optional().allow(''),
    phone: phone.optional().allow(''),
  }).min(1),
};

const adminLogin = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

const refresh = { body: Joi.object({ refreshToken: Joi.string().required() }) };

const firebasePhone = {
  body: Joi.object({
    idToken: Joi.string().required(),
    name: Joi.string().max(80).optional().allow(''),
  }),
};

module.exports = {
  requestOtp,
  verifyOtp,
  requestEmailOtp,
  verifyEmailOtp,
  updateProfile,
  adminLogin,
  refresh,
  firebasePhone,
};
