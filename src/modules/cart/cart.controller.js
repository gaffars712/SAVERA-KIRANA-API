const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./cart.service');

const getMine = catchAsync(async (req, res) => {
  const data = await service.getCart(req.user._id, { fulfillmentType: req.query.fulfillmentType });
  res.json({ success: true, data });
});

const add = catchAsync(async (req, res) => {
  const data = await service.addItem(req.user._id, req.body);
  res.status(httpStatus.CREATED).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await service.updateItem(req.user._id, req.body);
  res.json({ success: true, data });
});

const removeItem = catchAsync(async (req, res) => {
  const data = await service.removeItem(req.user._id, req.body.variantId);
  res.json({ success: true, data });
});

const clear = catchAsync(async (req, res) => {
  const data = await service.clear(req.user._id);
  res.json({ success: true, data });
});

const clearCoupon = catchAsync(async (req, res) => {
  await service.clearCoupon(req.user._id);
  const data = await service.getCart(req.user._id);
  res.json({ success: true, data });
});

module.exports = { getMine, add, update, removeItem, clear, clearCoupon };
