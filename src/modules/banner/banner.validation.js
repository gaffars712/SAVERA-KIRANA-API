const Joi = require('joi');

const objectId = Joi.string().hex().length(24);
const position = Joi.string().valid('home_hero', 'home_strip', 'category_top', 'cart_strip', 'checkout');
const linkType = Joi.string().valid('category', 'product', 'url', 'none');

const create = {
  body: Joi.object({
    title: Joi.string().min(1).max(120).required(),
    subtitle: Joi.string().allow('').max(200),
    imageUrl: Joi.string().uri().required(),
    imagePublicId: Joi.string().allow(''),
    mobileImageUrl: Joi.string().uri().allow(''),
    mobileImagePublicId: Joi.string().allow(''),
    position,
    linkType,
    linkRef: objectId,
    linkUrl: Joi.string().uri().allow(''),
    ctaText: Joi.string().allow(''),
    backgroundColor: Joi.string().allow(''),
    order: Joi.number().integer(),
    startsAt: Joi.date(),
    endsAt: Joi.date(),
    isActive: Joi.boolean(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: create.body.fork(['title', 'imageUrl'], (s) => s.optional()).min(1),
};

const list = {
  query: Joi.object({
    position,
    isActive: Joi.boolean(),
  }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

module.exports = { create, update, list, byId };
