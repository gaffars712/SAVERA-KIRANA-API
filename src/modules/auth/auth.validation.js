const Joi = require('joi');

const phone = Joi.string()
  .pattern(/^\+?[0-9]{10,15}$/)
  .required()
  .messages({ 'string.pattern.base': 'Phone must be 10-15 digits, optional leading +' });

const requestOtp = { body: Joi.object({ phone }) };

const verifyOtp = {
  body: Joi.object({
    phone,
    otp: Joi.string().length(6).pattern(/^[0-9]+$/).required(),
    name: Joi.string().max(80).optional().allow(''),
  }),
};

const adminLogin = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
};

const refresh = {
  body: Joi.object({ refreshToken: Joi.string().required() }),
};

module.exports = { requestOtp, verifyOtp, adminLogin, refresh };
