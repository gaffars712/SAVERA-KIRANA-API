const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const service = require('./product.service');

const list = catchAsync(async (req, res) => {
  const data = await service.search(req.query);
  res.json({ success: true, data });
});

const get = catchAsync(async (req, res) => {
  const data = await service.getById(req.params.id);
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

/* Public — no auth. Only published products. */
const publicList = catchAsync(async (req, res) => {
  const data = await service.search(req.query, { isPublic: true });
  res.json({ success: true, data });
});

const publicBySlug = catchAsync(async (req, res) => {
  const data = await service.getBySlug(req.params.slug);
  if (data.status !== 'published') {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data });
});

module.exports = { list, get, create, update, remove, publicList, publicBySlug };
