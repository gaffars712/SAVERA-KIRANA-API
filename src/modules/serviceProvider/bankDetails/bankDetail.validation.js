const Joi = require('joi');
const { objectId } = require('../../../validations/custom.validation');

const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const addBankDetailsValidation = {
  body: Joi.object().keys({
      serviceProviderId: Joi.string().required().messages({
        "string.empty": `Service Provider ID must contain a value`,
        "any.required": `Service Provider ID is a required field`,
      }),
      bankName: Joi.string().required().messages({
        "string.empty": `Bank Name must contain a value`,
        "any.required": `Bank Name is a required field`,
      }),
      bankHolderName: Joi.string().required().messages({
        "string.empty": `Bank Holder Name must contain a value`,
        "any.required": `Bank Holder Name is a required field`,
      }),
      accountNumber: Joi.string().required().messages({
        "string.empty": `Account Number must contain a value`,
        "any.required": `Account Number is a required field`,
      }),
      IFSCCode: Joi.string().pattern(ifscRegex).required().messages({
        "string.empty": `IFSC Code must contain a value`,
        "string.pattern.base": `IFSC Code must match the format /^[A-Z]{4}0[A-Z0-9]{6}$/`,
        "any.required": `IFSC Code is a required field`,
      }),
      active: Joi.boolean().default(true),
    }),
};


module.exports = {
    addBankDetailsValidation,
};
