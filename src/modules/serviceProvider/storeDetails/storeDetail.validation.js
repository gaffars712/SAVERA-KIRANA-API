const Joi = require('joi');
const { objectId } = require('../../../validations/custom.validation');

const addStore = {
  body: Joi.object().keys({
    bannerImage: Joi.string().allow('').optional(),
    profileImage: Joi.string().allow('').optional(),
    storeName: Joi.string().required().messages({
      "string.empty": `Store Name must contain value`,
      "any.required": `Store Name is a required field`,
    }),
    serviceProviderId: Joi.string().required().messages({
      "string.empty": `Service provider ID must contain value`,
      "any.required": `Service provider ID is a required field`
    }),
    storeURL: Joi.string().allow('').optional(),
    storeTags: Joi.array().items(Joi.string()).min(3).required().messages({
      "array.base": `Store Tags must be an array`,
      "array.min": `Store tags must contain at least Four tags`,
      "any.required": `Store Tags is a required field`,
    }),
    description: Joi.string().allow('').optional(),
    storeAddress: Joi.array().items(Joi.string()).min(1).required().messages({
      "array.base": `Store Address must be an array`,
      "array.min": `Store Address must contain at least one address`,
      "any.required": `Store Address is a required field`,
    }),
    gstNumber: Joi.string().required().messages({
      "string.empty": `GST Number must contain value`,
      "any.required": `GST Number is a required field`,
    }),
  }),
};

module.exports = {
  addStore,
};
