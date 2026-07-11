const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const create = {
  body: Joi.object({
    name: Joi.string().min(2).max(80).required(),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).required(),
    email: Joi.string().email().allow(''),
    photo: Joi.string().uri().allow(''),
    vehicle: Joi.string().allow(''),
    vehicleType: Joi.string().valid('bike', 'scooter', 'cycle', 'foot'),
    zones: Joi.array().items(objectId),
    documents: Joi.object({
      aadhaarUrl: Joi.string().uri().allow(''),
      dlUrl: Joi.string().uri().allow(''),
      panUrl: Joi.string().uri().allow(''),
    }),
    bank: Joi.object({
      accountName: Joi.string().allow(''),
      accountNumber: Joi.string().allow(''),
      ifsc: Joi.string().allow(''),
    }),
    active: Joi.boolean(),
    status: Joi.string().valid('online', 'delivering', 'break', 'offline'),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: create.body.fork(['name', 'phone'], (s) => s.optional()).min(1),
};

const list = {
  query: Joi.object({
    q: Joi.string().allow(''),
    status: Joi.string().valid('online', 'delivering', 'break', 'offline'),
    zone: objectId,
  }),
};

const setStatus = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    status: Joi.string().valid('online', 'delivering', 'break', 'offline').required(),
  }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

module.exports = { create, update, list, byId, setStatus };
