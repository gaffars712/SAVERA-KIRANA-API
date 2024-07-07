const Joi = require('joi');

// Joi validation schema
const auctionInfoValidation = {
  body: Joi.object().keys({
    procurementType: Joi.string().valid('farm-gate', 'warehouse').required().messages({
      "string.empty": `Procurement type must contain value`,
      "any.required": `Procurement type is a required field`,
      "any.only": `Procurement type must be either 'farm-gate' or 'warehouse'`
    }),
    auctionType: Joi.string().valid('buy', 'sell').required().messages({
      "string.empty": `Auction type must contain value`,
      "any.required": `Auction type is a required field`,
      "any.only": `Auction type must be either 'buy' or 'sell'`
    }),
    commodity: Joi.object({
      commodityType: Joi.string().required().messages({
        "string.empty": `Commodity type must contain value`,
        "any.required": `Commodity type is a required field`
      }),
      variety: Joi.string().required().messages({
        "string.empty": `Variety must contain value`,
        "any.required": `Variety is a required field`
      }),
      quantity: Joi.number().required().messages({
        "number.base": `Quantity must be a number`,
        "any.required": `Quantity is a required field`
      }),
      unit: Joi.string().valid('kg', 'liters', 'units', 'quintal', 'metricTonne(MT)').required().messages({
        "string.empty": `Unit must contain value`,
        "any.required": `Unit is a required field`,
        "any.only": `Unit must be one of 'kg', 'liters', 'units', 'quintal', 'metricTonne(MT)'  `
      })
    }).required(),
    commodityImages: Joi.array().items(Joi.string().allow('')).optional(),
    qualityCertificate: Joi.string().allow('').optional() ,
    priceInformation: Joi.object({
      reservePrice: Joi.object({
        price: Joi.number().required().messages({
          "number.base": `Reserve price must be a number`,
          "any.required": `Reserve price is a required field`
        }),
        unit: Joi.string().valid('kg', 'liters', 'units', 'quintal', 'metricTonne(MT)').required().messages({
          "string.empty": `Reserve price unit must contain value`,
          "any.required": `Reserve price unit is a required field`,
          "any.only": `Reserve price unit must be one of 'kg', 'liters', 'units', 'quintal', 'metricTonne(MT)'`
        })
      }).required(),
      initialPrice: Joi.object({
        price: Joi.number().required().messages({
          "number.base": `Initial price must be a number`,
          "any.required": `Initial price is a required field`
        }),
        unit: Joi.string().valid('kg', 'liters', 'units', 'quintal', 'metricTonne(MT)').required().messages({
          "string.empty": `Initial price unit must contain value`,
          "any.required": `Initial price unit is a required field`,
          "any.only": `Initial price unit must be one of 'kg', 'liters', 'units', 'quintal', 'metricTonne(MT)'`
        })
      }).required()
    }).required(),
    productSpecification: Joi.string().required().messages({
      "string.empty": `Product specification must contain value`,
      "any.required": `Product specification is a required field`
    }),
    active: Joi.boolean().default(true),
    serviceProviderId: Joi.string().required().messages({
      "string.empty": `Service provider ID must contain value`,
      "any.required": `Service provider ID is a required field`
    }),serviceProviderId: Joi.string().required().messages({
      "string.empty": `Service provider ID must contain value`,
      "any.required": `Service provider ID is a required field`
    }),
  })
};
const updateAuctionInfoValidation = {
  params: Joi.object().keys({
    id: Joi.string().required().messages({
      "string.empty": `Time and payment ID must contain value`,
      "any.required": `Time and payment ID is a required field`
    })
  })
}
const getAuctionInfoValidation = {
  params: Joi.object().keys({
    id: Joi.string().required().messages({
      "string.empty": `Time and payment ID must contain value`,
      "any.required": `Time and payment ID is a required field`
    })
  })
}
module.exports = {
  auctionInfoValidation,
  updateAuctionInfoValidation,
  getAuctionInfoValidation
};
