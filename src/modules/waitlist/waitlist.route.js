const express = require('express');
const Joi = require('joi');
const httpStatus = require('http-status');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const { Waitlist } = require('../../models');

const router = express.Router();

router.post(
  '/notify',
  validate({
    body: Joi.object({
      email: Joi.string().email().required(),
      pincode: Joi.string().length(6).pattern(/^\d+$/).required(),
      phone: Joi.string().pattern(/^\+?[0-9]{10,15}$/).allow(''),
    }),
  }),
  catchAsync(async (req, res) => {
    const { email, pincode, phone } = req.body;
    const doc = await Waitlist.findOneAndUpdate(
      { email, pincode },
      { $set: { email, pincode, phone, source: 'splash' } },
      { upsert: true, new: true }
    );
    res.status(httpStatus.CREATED).json({ success: true, data: { id: doc._id } });
  })
);

module.exports = router;
