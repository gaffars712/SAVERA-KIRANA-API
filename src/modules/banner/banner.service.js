const httpStatus = require('http-status');
const { Banner } = require('../../models');
const ApiError = require('../../utils/ApiError');

const list = (filter = {}) => {
  const q = {};
  if (filter.position) q.position = filter.position;
  if (filter.isActive !== undefined) q.isActive = filter.isActive === 'true' || filter.isActive === true;
  return Banner.find(q).sort({ order: 1, createdAt: -1 });
};

const getById = async (id) => {
  const b = await Banner.findById(id);
  if (!b) throw new ApiError(httpStatus.NOT_FOUND, 'Banner not found');
  return b;
};

const create = (data) => Banner.create(data);

const update = async (id, data) => {
  const b = await getById(id);
  Object.assign(b, data);
  await b.save();
  return b;
};

const remove = async (id) => {
  const b = await getById(id);
  await b.deleteOne();
  return { deleted: true };
};

const listPublic = (position) => Banner.getActive(position);

module.exports = { list, getById, create, update, remove, listPublic };
