const Joi = require('joi');

const orderValidation = Joi.object({
    cartId: Joi.string().required(),
    cartTotalAmount: Joi.number().required(),
    deliveryCharge: Joi.number().default(0),
    packagingCharge: Joi.number().default(0),
    discountAmount: Joi.number().default(0),
    address: Joi.object({
        street: Joi.string().default(''),
        city: Joi.string().default(''),
        state: Joi.string().default(''),
        zip: Joi.string().default(''),
        country: Joi.string().default('India')
    }),
    totalAmount: Joi.number().required()
});

module.exports = {
    orderValidation
};
