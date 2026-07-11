const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./deliveryZone.service');

const list = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.list() });
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
const check = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.checkServiceability(req.query.pincode) });
});

module.exports = { list, create, update, remove, check };
