const httpStatus = require('http-status');
const slugify = require('slugify');
const { Category } = require('../../models');
const ApiError = require('../../utils/ApiError');

const makeSlug = (name) => slugify(name, { lower: true, strict: true });

const uniqueSlug = async (name, excludeId) => {
  let base = makeSlug(name);
  let slug = base;
  let i = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await Category.exists({ slug, _id: { $ne: excludeId } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
};

const buildAncestors = async (parentId) => {
  if (!parentId) return [];
  const parent = await Category.findById(parentId);
  if (!parent) throw new ApiError(httpStatus.BAD_REQUEST, 'Parent category not found');
  return [
    ...parent.ancestors,
    { _id: parent._id, name: parent.name, slug: parent.slug },
  ];
};

const create = async (data) => {
  const slug = await uniqueSlug(data.name);
  const ancestors = await buildAncestors(data.parent);
  return Category.create({ ...data, slug, ancestors });
};

const list = async (filter = {}) => {
  const q = {};
  if (filter.parent === 'root') q.parent = null;
  else if (filter.parent) q.parent = filter.parent;
  if (filter.isActive !== undefined) q.isActive = filter.isActive === 'true' || filter.isActive === true;
  if (filter.isFeatured) q.isFeatured = true;
  if (filter.q) q.$or = [{ name: new RegExp(filter.q, 'i') }, { slug: new RegExp(filter.q, 'i') }];
  return Category.find(q).sort({ order: 1, name: 1 });
};

const getById = async (id) => {
  const cat = await Category.findById(id);
  if (!cat) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  return cat;
};

const getBySlug = async (slug) => {
  const cat = await Category.findOne({ slug });
  if (!cat) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  return cat;
};

const update = async (id, data) => {
  const cat = await getById(id);
  if (data.name && data.name !== cat.name) {
    cat.slug = await uniqueSlug(data.name, id);
  }
  if (data.parent !== undefined && String(data.parent) !== String(cat.parent)) {
    if (String(data.parent) === String(id)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Category cannot be its own parent');
    }
    cat.ancestors = await buildAncestors(data.parent);
  }
  Object.assign(cat, data);
  await cat.save();
  return cat;
};

const remove = async (id) => {
  const hasChildren = await Category.exists({ parent: id });
  if (hasChildren) throw new ApiError(httpStatus.BAD_REQUEST, 'Category has children, delete them first');
  const cat = await getById(id);
  await cat.deleteOne();
  return { deleted: true };
};

/** Return a nested tree (roots -> children -> ...). */
const tree = async () => {
  const all = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
  const byParent = new Map();
  all.forEach((c) => {
    const key = String(c.parent || 'root');
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  });
  const attach = (nodes) => nodes.map((n) => ({ ...n, children: attach(byParent.get(String(n._id)) || []) }));
  return attach(byParent.get('root') || []);
};

module.exports = { create, list, getById, getBySlug, update, remove, tree };
