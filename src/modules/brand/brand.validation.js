const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const create = {
  body: Joi.object({
    name: Joi.string().min(1).max(80).required(),
    logoUrl: Joi.string().uri().allow(''),
    logoPublicId: Joi.string().allow(''),
    description: Joi.string().allow('').max(500),
    isFeatured: Joi.boolean(),
    isActive: Joi.boolean(),
    order: Joi.number().integer(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(1).max(80),
    logoUrl: Joi.string().uri().allow(''),
    logoPublicId: Joi.string().allow(''),
    description: Joi.string().allow('').max(500),
    isFeatured: Joi.boolean(),
    isActive: Joi.boolean(),
    order: Joi.number().integer(),
  }).min(1),
};

const list = {
  query: Joi.object({
    q: Joi.string().allow(''),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean(),
  }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

module.exports = { create, update, list, byId };
