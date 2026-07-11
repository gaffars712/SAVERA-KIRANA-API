const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const create = {
  body: Joi.object({
    code: Joi.string().min(2).max(30).required(),
    title: Joi.string().allow(''),
    subtitle: Joi.string().allow(''),
    type: Joi.string().valid('flat', 'percent', 'free_delivery').required(),
    value: Joi.number().min(0),
    cap: Joi.number().min(0),
    minCart: Joi.number().min(0),
    applicableOn: Joi.string().valid('all', 'category', 'brand', 'product'),
    applicableRefs: Joi.array().items(Joi.any()),
    userType: Joi.string().valid('all', 'new', 'existing'),
    usageLimitTotal: Joi.number().integer().min(0),
    usageLimitPerUser: Joi.number().integer().min(1),
    validFrom: Joi.date(),
    validTo: Joi.date(),
    stackable: Joi.boolean(),
    isActive: Joi.boolean(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: create.body.fork(['code', 'type'], (s) => s.optional()).min(1),
};

const list = {
  query: Joi.object({
    q: Joi.string().allow(''),
    status: Joi.string().valid('active', 'inactive'),
  }),
};

const apply = {
  body: Joi.object({ code: Joi.string().min(2).max(30).required() }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

module.exports = { create, update, list, apply, byId };
