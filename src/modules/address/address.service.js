const httpStatus = require('http-status');
const { Address } = require('../../models');
const ApiError = require('../../utils/ApiError');

const list = (userId) => Address.find({ user: userId }).sort({ isDefault: -1, updatedAt: -1 });

const get = async (userId, id) => {
  const a = await Address.findOne({ _id: id, user: userId });
  if (!a) throw new ApiError(httpStatus.NOT_FOUND, 'Address not found');
  return a;
};

const create = async (userId, data) => {
  const count = await Address.countDocuments({ user: userId });
  const isDefault = data.isDefault ?? count === 0;
  return Address.create({ ...data, user: userId, isDefault });
};

const update = async (userId, id, data) => {
  const a = await get(userId, id);
  Object.assign(a, data);
  await a.save();
  return a;
};

const remove = async (userId, id) => {
  const a = await get(userId, id);
  const wasDefault = a.isDefault;
  await a.deleteOne();
  if (wasDefault) {
    const next = await Address.findOne({ user: userId }).sort({ updatedAt: -1 });
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
  return { deleted: true };
};

const setDefault = async (userId, id) => {
  const a = await get(userId, id);
  a.isDefault = true;
  await a.save();
  return a;
};

module.exports = { list, get, create, update, remove, setDefault };
