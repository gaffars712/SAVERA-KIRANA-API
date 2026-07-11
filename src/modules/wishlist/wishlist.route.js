const express = require('express');
const Joi = require('joi');
const httpStatus = require('http-status');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');
const service = require('./wishlist.service');

const router = express.Router();
router.use(auth('manageOwnProfile'));

const objectId = Joi.string().hex().length(24);
const productBody = { body: Joi.object({ productId: objectId.required() }) };

router.get(
  '/',
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await service.get(req.user._id) });
  })
);

router.post(
  '/',
  validate(productBody),
  catchAsync(async (req, res) => {
    const data = await service.add(req.user._id, req.body.productId);
    res.status(httpStatus.CREATED).json({ success: true, data });
  })
);

router.post(
  '/toggle',
  validate(productBody),
  catchAsync(async (req, res) => {
    const data = await service.toggle(req.user._id, req.body.productId);
    res.json({ success: true, data });
  })
);

router.delete(
  '/:productId',
  validate({ params: Joi.object({ productId: objectId.required() }) }),
  catchAsync(async (req, res) => {
    const data = await service.remove(req.user._id, req.params.productId);
    res.json({ success: true, data });
  })
);

module.exports = router;
