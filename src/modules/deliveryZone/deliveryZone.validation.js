const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const slot = Joi.object({
  label: Joi.string().required(),
  start: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  end: Joi.string().pattern(/^\d{2}:\d{2}$/).required(),
  capacity: Joi.number().min(0),
  activeDays: Joi.array().items(Joi.string().valid('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')),
  isActive: Joi.boolean(),
});

const create = {
  body: Joi.object({
    name: Joi.string().required(),
    pincodes: Joi.array().items(Joi.string().length(6).pattern(/^\d+$/)).required(),
    deliveryFee: Joi.number().min(0),
    minCartValue: Joi.number().min(0),
    freeDeliveryThreshold: Joi.number().min(0),
    slots: Joi.array().items(slot),
    isActive: Joi.boolean(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: create.body.fork(['name', 'pincodes'], (s) => s.optional()).min(1),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

const check = {
  query: Joi.object({ pincode: Joi.string().length(6).pattern(/^\d+$/).required() }),
};

module.exports = { create, update, byId, check };
