const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const create = {
  body: Joi.object({
    name: Joi.string().min(1).max(80).required(),
    description: Joi.string().allow('').max(500),
    parent: objectId.allow(null),
    imageUrl: Joi.string().uri().allow(''),
    imagePublicId: Joi.string().allow(''),
    iconUrl: Joi.string().uri().allow(''),
    order: Joi.number().integer(),
    isFeatured: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(1).max(80),
    description: Joi.string().allow('').max(500),
    parent: objectId.allow(null),
    imageUrl: Joi.string().uri().allow(''),
    imagePublicId: Joi.string().allow(''),
    iconUrl: Joi.string().uri().allow(''),
    order: Joi.number().integer(),
    isFeatured: Joi.boolean(),
    isActive: Joi.boolean(),
  }).min(1),
};

const list = {
  query: Joi.object({
    q: Joi.string().allow(''),
    parent: Joi.string().allow('root'),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean(),
  }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };
const bySlug = { params: Joi.object({ slug: Joi.string().required() }) };

module.exports = { create, update, list, byId, bySlug };
