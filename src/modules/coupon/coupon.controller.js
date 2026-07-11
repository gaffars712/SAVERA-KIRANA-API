const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./coupon.service');

const list = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.list(req.query) });
});
const create = catchAsync(async (req, res) => {
  res.status(httpStatus.CREATED).json({ success: true, data: await service.create(req.body) });
});
const update = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.update(req.params.id, req.body) });
});
const remove = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.remove(req.params.id) });
});
const apply = catchAsync(async (req, res) => {
  const data = await service.validateAndApply(req.user._id, req.body.code);
  res.json({ success: true, data });
});

module.exports = { list, create, update, remove, apply };
