const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const add = {
  body: Joi.object({
    productId: objectId.required(),
    variantId: objectId.required(),
    qty: Joi.number().integer().min(1),
  }),
};

const update = {
  body: Joi.object({
    variantId: objectId.required(),
    qty: Joi.number().integer().min(0).required(),
  }),
};

const remove = {
  body: Joi.object({ variantId: objectId.required() }),
};

const list = {
  query: Joi.object({ fulfillmentType: Joi.string().valid('delivery', 'pickup') }),
};

const applyCoupon = {
  body: Joi.object({ code: Joi.string().min(2).max(30).required() }),
};

module.exports = { add, update, remove, list, applyCoupon };
