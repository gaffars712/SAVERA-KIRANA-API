const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const phone = Joi.string().pattern(/^\+?[0-9]{10,15}$/);

const create = {
  body: Joi.object({
    tag: Joi.string().valid('Home', 'Work', 'Other'),
    name: Joi.string().min(1).max(80).required(),
    phone: phone.required(),
    line1: Joi.string().min(1).max(120).required(),
    line2: Joi.string().max(120).allow(''),
    landmark: Joi.string().max(120).allow(''),
    city: Joi.string().min(1).max(60).required(),
    state: Joi.string().min(1).max(60).required(),
    pincode: Joi.string().length(6).pattern(/^\d+$/).required(),
    location: Joi.object({ lat: Joi.number(), lng: Joi.number() }),
    isDefault: Joi.boolean(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: create.body.fork(['name', 'phone', 'line1', 'city', 'state', 'pincode'], (s) => s.optional()).min(1),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

module.exports = { create, update, byId };
