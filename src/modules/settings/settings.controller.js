const catchAsync = require('../../utils/catchAsync');
const service = require('./settings.service');

const getAdminSettings = catchAsync(async (req, res) => {
  const data = await service.getSettings();
  res.json({ success: true, data });
});

const updateSettings = catchAsync(async (req, res) => {
  const data = await service.updateSettings(req.body);
  res.json({ success: true, data });
});

const getPublicFulfillment = catchAsync(async (req, res) => {
  const data = await service.getPublicFulfillment();
  res.json({ success: true, data });
});

module.exports = { getAdminSettings, updateSettings, getPublicFulfillment };
