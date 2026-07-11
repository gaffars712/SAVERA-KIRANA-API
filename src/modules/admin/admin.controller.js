const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./admin.service');

const list = catchAsync(async (req, res) => {
  const data = await service.listAdmins(req.query, req.query);
  res.json({ success: true, data });
});

const get = catchAsync(async (req, res) => {
  const admin = await service.getAdmin(req.params.id);
  res.json({ success: true, data: admin });
});

const create = catchAsync(async (req, res) => {
  const admin = await service.createAdmin(req.body, req.user._id);
  res.status(httpStatus.CREATED).json({ success: true, data: admin });
});

const update = catchAsync(async (req, res) => {
  const admin = await service.updateAdmin(req.params.id, req.body);
  res.json({ success: true, data: admin });
});

const deactivate = catchAsync(async (req, res) => {
  const admin = await service.deactivateAdmin(req.params.id);
  res.json({ success: true, data: admin });
});

const activate = catchAsync(async (req, res) => {
  const admin = await service.activateAdmin(req.params.id);
  res.json({ success: true, data: admin });
});

module.exports = { list, get, create, update, deactivate, activate };
