const Joi = require('joi');
const { objectId } = require('../../validations/custom.validation'); 

const productValidationSchema = {
  body: Joi.object().keys({
    name: Joi.string().required().messages({
      'string.empty': 'Product name must contain a value',
      'any.required': 'Product name is a required field',
    }),
    bannerImage: Joi.string().required().messages({
      'string.empty': 'Banner image must contain a value',
      'any.required': 'Banner image is a required field',
    }),
    subImages: Joi.array().items(Joi.string()).default([]).messages({
      'array.base': 'Sub images must be an array of strings',
    }),
    type: Joi.array().items(Joi.string()).default([]).messages({
      'array.base': 'Type must be an array of strings',
    }),
    category: Joi.string().required().messages({
      'string.empty': 'Category must contain a value',
      'any.required': 'Category is a required field',
    }),
    variety: Joi.string().required().messages({
      'string.empty': 'Variety must contain a value',
      'any.required': 'Variety is a required field',
    }),
    inventory: Joi.object({
      unit: Joi.string().required().messages({
        'string.empty': 'Inventory unit must contain a value',
        'any.required': 'Inventory unit is a required field',
      }),
      quantity: Joi.number().min(0).required().messages({
        'number.base': 'Inventory quantity must be a number',
        'number.min': 'Inventory quantity must be at least 0',
        'any.required': 'Inventory quantity is a required field',
      }),
    }).required().messages({
      'object.base': 'Inventory must be an object',
      'any.required': 'Inventory is a required field',
    }),
    description: Joi.string().required().messages({
      'string.empty': 'Description must contain a value',
      'any.required': 'Description is a required field',
    }),
    price: Joi.object({
      sellingCost: Joi.number().required().messages({
        'number.base': 'Selling cost must be a number',
        'any.required': 'Selling cost is a required field',
      }),
      originalCost: Joi.number().required().messages({
        'number.base': 'Original cost must be a number',
        'any.required': 'Original cost is a required field',
      }),
      unit: Joi.string().required().messages({
        'string.empty': 'Price unit must contain a value',
        'any.required': 'Price unit is a required field',
      }),
      quantity: Joi.number().min(1).required().messages({
        'number.base': 'Price quantity must be a number',
        'number.min': 'Price quantity must be at least 1',
        'any.required': 'Price quantity is a required field',
      }),
    }).required().messages({
      'object.base': 'Price must be an object',
      'any.required': 'Price is a required field',
    }),
    isFeatured: Joi.boolean().default(false).messages({
      'boolean.base': 'IsFeatured must be a boolean',
    }),
    serviceProviderId: Joi.string().hex().length(24).required().custom(objectId).messages({
      'string.empty': 'Service Provider ID must contain a value',
      'string.hex': 'Service Provider ID must be a valid ObjectId',
      'string.length': 'Service Provider ID must be 24 characters long',
      'any.required': 'Service Provider ID is a required field',
    }),
    active: Joi.boolean().default(true).messages({
      'boolean.base': 'Active must be a boolean',
    }),
    seqId: Joi.number().integer().optional().messages({
      'number.base': 'SeqId must be a number',
      'number.integer': 'SeqId must be an integer',
    }),
  }),
};

module.exports = {
  productValidationSchema,
};
