const Joi = require('joi');
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

const addTimeandpayment = {
  body: Joi.object().keys({
    StartDate: Joi.date().required().messages({
      "date.base": `StartDate must be a valid date`,
      "any.required": `StartDate is a required field`,
    }),
    EndDate: Joi.date().required().messages({
      "date.base": `EndDate must be a valid date`,
      "any.required": `EndDate is a required field`,
    }),
    bank: Joi.string().trim().required().messages({
      "string.empty": `Bank must contain value`,
      "any.required": `Bank is a required field`,
    }),
    userName: Joi.string().trim().required().messages({
      "string.empty": `userName must contain value`,
      "any.required": `userName is a required field`,
    }),
    IFSCCode: Joi.string().trim().pattern(ifscRegex).required().messages({
      "string.empty": `IFSC Code must contain a value`,
      "string.pattern.base": `IFSC Code must match the format /^[A-Z]{4}0[A-Z0-9]{6}$/`,
      "any.required": `IFSC Code is a required field`,
    }),
    accountNumber: Joi.string().trim().pattern(/^\d{12}$/).required().messages({
      "string.empty": `AccountNo must contain value`,
      "string.pattern.base": `AccountNo must be exactly 12 digits`,
      "any.required": `AccountNo is a required field`,
    }),
    auctionId: Joi.string().trim().required().messages({
      "string.empty": `AuctionId must contain value`,
      "any.required": `AuctionId is a required field`,
    }),
  }),

  
};

const UpdateTimeandpaymentInfoValidation = {
  params: Joi.object().keys({
    id: Joi.string().required().messages({
      "string.empty": `Time and payment ID must contain value`,
      "any.required": `Time and payment ID is a required field`
    })
  })
}

const getTimeandPayment = {
  params: Joi.object().keys({
    id: Joi.string().required().messages({
      "string.empty": `Time and payment ID must contain value`,
      "any.required": `Time and payment ID is a required field`
    })
  })
}


module.exports = {
  addTimeandpayment,
  UpdateTimeandpaymentInfoValidation,
  getTimeandPayment
};
