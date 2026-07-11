const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./order.service');

/* ── Customer ── */
const create = catchAsync(async (req, res) => {
  const data = await service.createOrder(req.user._id, req.body);
  res.status(httpStatus.CREATED).json({ success: true, data });
});

const verifyPayment = catchAsync(async (req, res) => {
  const data = await service.verifyPayment(req.user._id, req.body);
  res.json({ success: true, data });
});

const getMine = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.getMine(req.user._id, req.params.id) });
});

const listMine = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.listMine(req.user._id, req.query) });
});

const cancelMine = catchAsync(async (req, res) => {
  const data = await service.cancel(req.params.id, req.body.reason, req.user._id, 'customer');
  res.json({ success: true, data });
});

/* ── Admin ── */
const adminList = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.adminList(req.query) });
});

const adminGet = catchAsync(async (req, res) => {
  res.json({ success: true, data: await service.adminGet(req.params.id) });
});

const adminTransition = catchAsync(async (req, res) => {
  const data = req.body.status === 'cancelled'
    ? await service.cancel(req.params.id, req.body.reason, req.user._id)
    : await service.transitionStatus(req.params.id, req.body.status, req.user._id);
  res.json({ success: true, data });
});

const adminAssignRider = catchAsync(async (req, res) => {
  const data = await service.assignRider(req.params.id, req.body.riderId, req.user._id);
  res.json({ success: true, data });
});

const startPreparing = catchAsync(async (req, res) => {
  const data = await service.startPreparing(req.params.id);
  res.json({ success: true, data });
});

const markReady = catchAsync(async (req, res) => {
  const data = await service.markReady(req.params.id, req.user._id);
  res.json({ success: true, data });
});

const verifyPickup = catchAsync(async (req, res) => {
  const data = await service.verifyPickupCode(req.params.id, req.body, req.user._id);
  res.json({ success: true, data });
});

module.exports = {
  create,
  verifyPayment,
  getMine,
  listMine,
  cancelMine,
  adminList,
  adminGet,
  adminTransition,
  adminAssignRider,
  startPreparing,
  markReady,
  verifyPickup,
};
