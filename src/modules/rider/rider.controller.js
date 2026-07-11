const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./rider.service');

const list = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.list(req.query) });
});
const get = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.get(req.params.id) });
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
const setStatus = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.setStatus(req.params.id, req.body.status) });
});

module.exports = { list, get, create, update, remove, setStatus };
