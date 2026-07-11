const httpStatus = require('http-status');
const { Coupon } = require('../../models');
const ApiError = require('../../utils/ApiError');
const cartService = require('../cart/cart.service');

/* ─────────────────── Admin CRUD ─────────────────── */

const list = async (filter = {}) => {
  const q = {};
  if (filter.status === 'active') q.isActive = true;
  if (filter.status === 'inactive') q.isActive = false;
  if (filter.q) q.code = new RegExp(filter.q.toUpperCase(), 'i');
  return Coupon.find(q).sort({ createdAt: -1 });
};

const create = async (data) => {
  const exists = await Coupon.exists({ code: data.code.toUpperCase() });
  if (exists) throw new ApiError(httpStatus.CONFLICT, 'Coupon code already exists');
  return Coupon.create(data);
};

const update = async (id, data) => {
  const c = await Coupon.findById(id);
  if (!c) throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  Object.assign(c, data);
  await c.save();
  return c;
};

const remove = async (id) => {
  const c = await Coupon.findById(id);
  if (!c) throw new ApiError(httpStatus.NOT_FOUND, 'Coupon not found');
  await c.deleteOne();
  return { deleted: true };
};

/* ─────────────────── Customer apply ─────────────────── */

const validateAndApply = async (userId, rawCode) => {
  const code = String(rawCode).trim().toUpperCase();
  const coupon = await Coupon.findOne({ code });
  if (!coupon) throw new ApiError(httpStatus.NOT_FOUND, 'Invalid coupon code');
  if (!coupon.isActive) throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon is not active');

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon not started yet');
  if (coupon.validTo && coupon.validTo < now) throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon has expired');
  if (coupon.usageLimitTotal && coupon.usedCount >= coupon.usageLimitTotal) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Coupon usage limit reached');
  }

  const { cart, totals } = await cartService.getCart(userId);
  if (!cart.items.length) throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  if (totals.subtotal < coupon.minCart) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Minimum cart value ₹${coupon.minCart} required`
    );
  }

  let discount = 0;
  if (coupon.type === 'flat') discount = coupon.value;
  else if (coupon.type === 'percent') {
    discount = Math.round((totals.subtotal * coupon.value) / 100);
    if (coupon.cap) discount = Math.min(discount, coupon.cap);
  }
  // free_delivery: discount stays 0, cart.couponMeta.type flags it

  await cartService.setCoupon(userId, {
    code: coupon.code,
    discount,
    meta: { type: coupon.type, couponId: coupon._id, title: coupon.title },
  });

  const updated = await cartService.getCart(userId);
  return { coupon, ...updated };
};

const incrementUsed = async (couponId) => {
  await Coupon.updateOne({ _id: couponId }, { $inc: { usedCount: 1 } });
};

module.exports = {
  list,
  create,
  update,
  remove,
  validateAndApply,
  incrementUsed,
};
