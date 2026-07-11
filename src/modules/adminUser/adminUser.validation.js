const Joi = require('joi');

const objectId = Joi.string().hex().length(24);

const list = {
  query: Joi.object({
    q: Joi.string().allow(''),
    active: Joi.string().valid('true', 'false'),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

module.exports = { list, byId };
