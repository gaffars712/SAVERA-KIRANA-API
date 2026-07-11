const Joi = require('joi');
const { adminRoles } = require('../../config/roles');

const objectId = Joi.string().hex().length(24);

const create = {
  body: Joi.object({
    name: Joi.string().min(2).max(80).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).optional().allow(''),
    password: Joi.string().min(6).optional(),
    role: Joi.string().valid(...adminRoles).required(),
    avatarUrl: Joi.string().uri().allow('').optional(),
    active: Joi.boolean().optional(),
  }),
};

const update = {
  params: Joi.object({ id: objectId.required() }),
  body: Joi.object({
    name: Joi.string().min(2).max(80),
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).allow(''),
    password: Joi.string().min(6),
    role: Joi.string().valid(...adminRoles),
    avatarUrl: Joi.string().uri().allow(''),
    active: Joi.boolean(),
  }).min(1),
};

const byId = { params: Joi.object({ id: objectId.required() }) };

const list = {
  query: Joi.object({
    q: Joi.string().allow(''),
    role: Joi.string().valid(...adminRoles),
    active: Joi.boolean(),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

module.exports = { create, update, byId, list };
