const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./address.service');

const list = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.list(req.user._id) });
});
const get = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.get(req.user._id, req.params.id) });
});
const create = catchAsync(async (req, res) => {
  res.status(httpStatus.CREATED).json({ success: true, data: await service.create(req.user._id, req.body) });
});
const update = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.update(req.user._id, req.params.id, req.body) });
});
const remove = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.remove(req.user._id, req.params.id) });
});
const setDefault = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.setDefault(req.user._id, req.params.id) });
});

module.exports = { list, get, create, update, remove, setDefault };
