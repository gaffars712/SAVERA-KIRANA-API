const httpStatus = require('http-status');
const { Rider } = require('../../models');
const ApiError = require('../../utils/ApiError');

const list = async (filter = {}) => {
  const q = {};
  if (filter.status) q.status = filter.status;
  if (filter.zone) q.zones = filter.zone;
  if (filter.q) q.$or = [{ name: new RegExp(filter.q, 'i') }, { phone: new RegExp(filter.q, 'i') }];
  return Rider.find(q).sort({ status: 1, name: 1 });
};

const get = async (id) => {
  const r = await Rider.findById(id).populate('zones', 'name');
  if (!r) throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');
  return r;
};

const create = async (data) => {
  if (await Rider.exists({ phone: data.phone })) {
    throw new ApiError(httpStatus.CONFLICT, 'Phone already registered');
  }
  return Rider.create(data);
};

const update = async (id, data) => {
  const r = await get(id);
  Object.assign(r, data);
  await r.save();
  return r;
};

const remove = async (id) => {
  const r = await get(id);
  await r.deleteOne();
  return { deleted: true };
};

const setStatus = async (id, status) => {
  const r = await get(id);
  r.status = status;
  await r.save();
  return r;
};

module.exports = { list, get, create, update, remove, setStatus };
