const Joi = require('joi');
const { password, emailCustom, objectId } = require('./custom.validation');



const updateProfile = {

  body: Joi.object().keys({
    email: Joi.string().required().email().messages({
      "string.empty": `Email must contain value`,
      "any.required": `Email is a required field`,
      "string.email": `Email must be valid mail`,
    }),
    name: Joi.string().required().messages({
        "string.empty": `Name must contain value`,
        "any.required": `Name is a required field`,
      }),
  }),
};

module.exports = {
  updateProfile,
};