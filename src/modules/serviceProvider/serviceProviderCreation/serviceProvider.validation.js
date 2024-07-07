const Joi = require('joi');
const { objectId } = require('../../../validations/custom.validation');

const addServiceProvider = {
  body: Joi.object().keys({
    serviceProviderRole: Joi.string().required().messages({
      "string.empty": `Role must contain value`,
      "any.required": `Role is a required field`,
    }),
    nameOfServiceProvider: Joi.string().required().messages({
      "string.empty": `Name must contain value`,
      "any.required": `Name is a required field`,
    }),
    aadharNumber: Joi.number().integer().min(100000000000).max(999999999999).required().messages({
      "number.base": `Aadhar must be a number`,
      "number.min": `Aadhar must be a 12-digit number`,
      "number.max": `Aadhar must be a 12-digit number`,
      "any.required": `Aadhar is a required field`,
    }),
  }),
};
module.exports = {
  addServiceProvider,
};
