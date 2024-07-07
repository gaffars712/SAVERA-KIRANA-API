const Joi = require('joi');
const { emailCustom } = require('./custom.validation');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.empty": `Email must contain value`,
      "any.required": `Email is a required field`,
      "string.email": `Email must be valid mail`,
    }),
    name: Joi.string().required().messages({
      "string.empty": `First name must contain value`,
      "any.required": `First name is a required field`
    }),
    accessRole: Joi.string().required().messages({
      "string.empty": `Access role must contain value`,
      "any.required": `Access role is a required field`
    }),
    phone: Joi.string().required().length(10).pattern(/^[0-9]+$/).messages({
      "string.empty": `Phone number must contain value`,
      "any.required": `Phone number is a required field`,
      "string.length": `Phone number must be exactly 10 digits long`,
      "string.pattern.base": `Phone number must contain only digits`
    })

  }),
};

const signup = {
  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.empty": `Email must contain value`,
      "any.required": `Email is a required field`,
      "string.email": `Email must be valid mail`,
    }),
    name: Joi.string().required().messages({
      "string.empty": `First name must contain value`,
      "any.required": `First name is a required field`
    }),
    phone: Joi.string().optional(),
    isGoogleUser: Joi.boolean().optional(),
    isFacebookUser: Joi.boolean().optional()
  }),
};

const login = {
  body: Joi.object().keys({
    phone: Joi.string().required().length(10).pattern(/^[0-9]+$/).messages({
      "string.empty": `Phone number must contain value`,
      "any.required": `Phone number is a required field`,
      "string.length": `Phone number must be exactly 10 digits long`,
      "string.pattern.base": `Phone number must contain only digits`
    })
  }),
};


const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    otp : Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  signup,
  verifyOtp
};
