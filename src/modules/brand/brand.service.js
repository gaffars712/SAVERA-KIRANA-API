const httpStatus = require('http-status');
const slugify = require('slugify');
const { Brand } = require('../../models');
const ApiError = require('../../utils/ApiError');

const uniqueSlug = async (name, excludeId) => {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Brand.exists({ slug, _id: { $ne: excludeId } })) slug = `${base}-${i++}`;
  return slug;
};

const create = async (data) => {
  const slug = await uniqueSlug(data.name);
  return Brand.create({ ...data, slug });
};

const list = async (filter = {}) => {
  const q = {};
  if (filter.isActive !== undefined)
    q.isActive = filter.isActive === 'true' || filter.isActive === true;
  if (filter.isFeatured) q.isFeatured = true;
  if (filter.q) q.name = new RegExp(filter.q, 'i');
  return Brand.find(q).sort({ order: 1, name: 1 });
};

const getById = async (id) => {
  const b = await Brand.findById(id);
  if (!b) throw new ApiError(httpStatus.NOT_FOUND, 'Brand not found');
  return b;
};

const update = async (id, data) => {
  const b = await getById(id);
  if (data.name && data.name !== b.name) b.slug = await uniqueSlug(data.name, id);
  Object.assign(b, data);
  await b.save();
  return b;
};

const remove = async (id) => {
  const b = await getById(id);
  await b.deleteOne();
  return { deleted: true };
};

module.exports = { create, list, getById, update, remove };
