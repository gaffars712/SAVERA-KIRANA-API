const Joi = require("joi");
const { objectId } = require("../../../../validations/custom.validation");

const addWarehouse = {
    body: Joi.object().keys({

        deliverFrom: Joi.string()
            .valid("ownWH", "thirdPartyWH")
            .required()
            .messages({
                "string.empty": `Select Warehouse!`,
                "any.required": `Warehouse deliverFrom is a required field`,
            }),
        nameOfWarehouse: Joi.string().required().messages({
            "string.empty": `Select Warehouse Name!`,
            "any.required": `Warehouse Name is a required field`,
        }),
        warehouseNumber: Joi.string().required().messages({
            "string.empty": `Warehouse Number must contain value`,
            "any.required": `Warehouse Number is a required field`,
        }),
        auctionId: Joi.string().required().messages({
            "string.empty": `Auction ID must contain value`,
            "any.required": `Auction ID is a required field`
          }),
        address: Joi.object({
            street: Joi.string().required().messages({
                "string.empty": `Street must contain value`,
                "any.required": `Street is a required field`,
            }),
            landmark: Joi.string().required().messages({
                "string.empty": `Landmark must contain value`,
                "any.required": `Landmark is a required field`,
            }),
            pincode: Joi.string().required().messages({
                "string.empty": `Pincode must contain value`,
                "any.required": `Pincode is a required field`,
            }),
            country: Joi.string().required().messages({
                "string.empty": `Country must contain value`,
                "any.required": `Country is a required field`,
            }),
            state: Joi.string().required().messages({
                "string.empty": `State must contain value`,
                "any.required": `State is a required field`,
            }),
            city: Joi.string().required().messages({
                "string.empty": `City must contain value`,
                "any.required": `City is a required field`,
            }),
        }).required(),

        active: Joi.boolean().default(true), // Validate active field as well
    }),
};

const updateWarehouse = {
    params: Joi.object().keys({
      id: Joi.string().required().messages({
        "string.empty": `Time and payment ID must contain value`,
        "any.required": `Time and payment ID is a required field`
      })
    })
  }

  const getWarehouse = {
    params: Joi.object().keys({
      id: Joi.string().required().messages({
        "string.empty": `Time and payment ID must contain value`,
        "any.required": `Time and payment ID is a required field`
      })
    })
  }

module.exports = {
    addWarehouse,
    updateWarehouse,
    getWarehouse
};
