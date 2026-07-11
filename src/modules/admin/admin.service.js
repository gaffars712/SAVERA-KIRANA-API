const httpStatus = require('http-status');
const { Admin } = require('../../models');
const ApiError = require('../../utils/ApiError');
const emailService = require('../../services/email.service');

const listAdmins = async (filter = {}, options = {}) => {
  const page = Math.max(1, parseInt(options.page, 10) || 1);
  const limit = Math.min(100, parseInt(options.limit, 10) || 20);
  const query = {};
  if (filter.role) query.role = filter.role;
  if (filter.active !== undefined) query.active = filter.active === 'true' || filter.active === true;
  if (filter.q) {
    query.$or = [
      { name: new RegExp(filter.q, 'i') },
      { email: new RegExp(filter.q, 'i') },
    ];
  }
  const [items, total] = await Promise.all([
    Admin.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Admin.countDocuments(query),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const getAdmin = async (id) => {
  const admin = await Admin.findById(id);
  if (!admin) throw new ApiError(httpStatus.NOT_FOUND, 'Admin not found');
  return admin;
};

const createAdmin = async (data, createdBy) => {
  if (await Admin.isEmailTaken(data.email)) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already taken');
  }
  const admin = await Admin.create({
    ...data,
    createdBy,
    invitedAt: new Date(),
    isActivated: false,
  });

  // Fire-and-forget invite email — do not block admin creation on SMTP hiccups.
  let inviter = null;
  if (createdBy) inviter = await Admin.findById(createdBy).select('name');
  emailService
    .sendAdminInvite(admin.email, {
      name: admin.name,
      role: admin.role,
      invitedByName: inviter?.name || 'Savera Kirana',
    })
    .catch(() => {});

  return admin;
};

const updateAdmin = async (id, data) => {
  const admin = await getAdmin(id);
  if (data.email && data.email !== admin.email && (await Admin.isEmailTaken(data.email, id))) {
    throw new ApiError(httpStatus.CONFLICT, 'Email already taken');
  }
  Object.assign(admin, data);
  await admin.save();
  return admin;
};

const deactivateAdmin = async (id) => {
  const admin = await getAdmin(id);
  admin.active = false;
  await admin.save();
  return admin;
};

const activateAdmin = async (id) => {
  const admin = await getAdmin(id);
  admin.active = true;
  await admin.save();
  return admin;
};

module.exports = {
  listAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deactivateAdmin,
  activateAdmin,
};
