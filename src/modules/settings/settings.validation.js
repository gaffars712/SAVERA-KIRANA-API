const Joi = require('joi');

const openHours = Joi.object({
  open: Joi.string().pattern(/^\d{2}:\d{2}$/),
  close: Joi.string().pattern(/^\d{2}:\d{2}$/),
  closed: Joi.boolean(),
});

const update = {
  body: Joi.object({
    store: Joi.object({
      name: Joi.string(),
      tagline: Joi.string().allow(''),
      gstin: Joi.string().allow(''),
      fssai: Joi.string().allow(''),
      address: Joi.object({
        line1: Joi.string().allow(''),
        line2: Joi.string().allow(''),
        city: Joi.string().allow(''),
        state: Joi.string().allow(''),
        pincode: Joi.string().allow(''),
      }),
      location: Joi.object({
        lat: Joi.number(),
        lng: Joi.number(),
      }),
      phone: Joi.string().allow(''),
      email: Joi.string().email().allow(''),
      logoUrl: Joi.string().uri().allow(''),
      photos: Joi.array().items(Joi.string().uri()),
      openHours: Joi.object({
        mon: openHours, tue: openHours, wed: openHours, thu: openHours,
        fri: openHours, sat: openHours, sun: openHours,
      }),
    }),
    fulfillment: Joi.object({
      mode: Joi.string().valid('delivery', 'pickup', 'both'),
      pickupPrepTime: Joi.number().min(5).max(240),
      pickupInstructions: Joi.string().allow(''),
      pickupCodeLength: Joi.number().valid(4, 6),
      autoNotifyOnReady: Joi.boolean(),
      allowManualCall: Joi.boolean(),
      notifyChannels: Joi.object({
        push: Joi.boolean(),
        sms: Joi.boolean(),
        whatsapp: Joi.boolean(),
      }),
    }),
    delivery: Joi.object({
      defaultFee: Joi.number().min(0),
      freeDeliveryThreshold: Joi.number().min(0),
      packagingFee: Joi.number().min(0),
      handlingFee: Joi.number().min(0),
      minCartValue: Joi.number().min(0),
    }),
    payment: Joi.object({
      codEnabled: Joi.boolean(),
      codLimit: Joi.number().min(0),
      razorpayEnabled: Joi.boolean(),
      walletEnabled: Joi.boolean(),
    }),
    tax: Joi.object({
      defaultGstSlab: Joi.number().valid(0, 5, 12, 18, 28),
      pricesIncludeGst: Joi.boolean(),
    }),
  }).min(1),
};

module.exports = { update };
