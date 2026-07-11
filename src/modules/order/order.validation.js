const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const create = {
  body: Joi.object({
    fulfillmentType: Joi.string().valid('delivery', 'pickup').required(),
    addressId: objectId.when('fulfillmentType', { is: 'delivery', then: Joi.required() }),
    slot: Joi.string().required(),
    payment: Joi.object({
      method: Joi.string().valid('razorpay', 'upi', 'card', 'netbanking', 'wallet', 'cod').required(),
    }).required(),
    notes: Joi.string().allow('').max(400),
  }),
};

const verify = {
  body: Joi.object({
    orderId: objectId.required(),
    razorpayOrderId: Joi.string().required(),
    razorpayPaymentId: Joi.string().required(),
    razorpaySignature: Joi.string().required(),
  }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

const listMine = {
  query: Joi.object({
    status: Joi.string(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(50),
  }),
};

const cancelMine = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({ reason: Joi.string().max(200).allow('') }),
};

const adminList = {
  query: Joi.object({
    q: Joi.string().allow(''),
    status: Joi.string(),
    fulfillmentType: Joi.string().valid('delivery', 'pickup'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

const transition = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    status: Joi.string()
      .valid('packed', 'out_for_delivery', 'delivered', 'preparing', 'ready', 'picked_up', 'cancelled')
      .required(),
    reason: Joi.string().max(200).allow(''),
  }),
};

const assign = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({ riderId: objectId.required() }),
};

const verifyPickup = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    code: Joi.string().length(4).pattern(/^\d+$/).required(),
    cashCollected: Joi.number().min(0),
  }),
};

module.exports = {
  create,
  verify,
  byId,
  listMine,
  cancelMine,
  adminList,
  transition,
  assign,
  verifyPickup,
};
