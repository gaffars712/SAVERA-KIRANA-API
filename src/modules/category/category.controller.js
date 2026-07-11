const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./category.service');

const list = catchAsync(async (req, res) => {
  const data = await service.list(req.query);
  res.json({ success: true, data });
});

const tree = catchAsync(async (req, res) => {
  const data = await service.tree();
  res.json({ success: true, data });
});

const get = catchAsync(async (req, res) => {
  const data = await service.getById(req.params.id);
  res.json({ success: true, data });
});

const getBySlug = catchAsync(async (req, res) => {
  const data = await service.getBySlug(req.params.slug);
  res.json({ success: true, data });
});

const create = catchAsync(async (req, res) => {
  const data = await service.create(req.body);
  res.status(httpStatus.CREATED).json({ success: true, data });
});

const update = catchAsync(async (req, res) => {
  const data = await service.update(req.params.id, req.body);
  res.json({ success: true, data });
});

const remove = catchAsync(async (req, res) => {
  const data = await service.remove(req.params.id);
  res.json({ success: true, data });
});

module.exports = { list, tree, get, getBySlug, create, update, remove };
