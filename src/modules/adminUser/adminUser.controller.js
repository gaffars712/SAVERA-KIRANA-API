const catchAsync = require('../../utils/catchAsync');
const service = require('./adminUser.service');

const list = catchAsync(async (req, res) => {
  const data = await service.listUsers(req.query);
  res.json({ success: true, data });
});

const get = catchAsync(async (req, res) => {
  const data = await service.getUser(req.params.id);
  res.json({ success: true, data });
});

const deactivate = catchAsync(async (req, res) => {
  const user = await service.setActive(req.params.id, false);
  res.json({ success: true, data: user });
});

const activate = catchAsync(async (req, res) => {
  const user = await service.setActive(req.params.id, true);
  res.json({ success: true, data: user });
});

module.exports = { list, get, deactivate, activate };
