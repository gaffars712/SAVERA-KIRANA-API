const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { Order, Product, Cart, Settings, DeliveryZone } = require('../../models');
const ApiError = require('../../utils/ApiError');
const cartService = require('../cart/cart.service');
const couponService = require('../coupon/coupon.service');
const addressService = require('../address/address.service');
const razorpay = require('../../services/razorpay.service');
const smsService = require('../../services/sms.service');
const logger = require('../../config/logger');

/* ─────────────────── Helpers ─────────────────── */

const generateOrderCode = () =>
  'SK-' + String(Math.floor(20000 + Math.random() * 79999));

const generatePickupCode = (length = 4) =>
  String(Math.floor(Math.random() * 10 ** length)).padStart(length, '0');

const settingsFulfillmentAllows = async (type) => {
  const s = await Settings.getSingleton();
  const mode = s.fulfillment.mode;
  if (mode === 'both') return true;
  return mode === type;
};

/**
 * Decrement stock on order create.
 * NOTE: full ACID needs a transaction; for a single-store app the simple version is fine.
 */
const decrementStock = async (items) => {
  for (const it of items) {
    // eslint-disable-next-line no-await-in-loop
    await Product.updateOne(
      { _id: it.product, 'variants._id': it.variantId },
      { $inc: { 'variants.$.stock': -it.qty, salesCount: it.qty } }
    );
  }
};

const restoreStock = async (items) => {
  for (const it of items) {
    // eslint-disable-next-line no-await-in-loop
    await Product.updateOne(
      { _id: it.product, 'variants._id': it.variantId },
      { $inc: { 'variants.$.stock': it.qty } }
    );
  }
};

/* ─────────────────── Create order ─────────────────── */

/**
 * Body:
 *  { fulfillmentType, addressId?, slot, payment: { method } }
 */
const createOrder = async (userId, body) => {
  const { fulfillmentType, addressId, slot, payment } = body;

  // 1. Fulfillment allowed by admin?
  if (!(await settingsFulfillmentAllows(fulfillmentType))) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Fulfillment mode "${fulfillmentType}" is disabled`);
  }

  // 2. Fetch cart + totals
  const { cart, totals } = await cartService.getCart(userId, { fulfillmentType });
  if (!cart.items.length) throw new ApiError(httpStatus.BAD_REQUEST, 'Cart is empty');
  if (totals.belowMin) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Add ₹${totals.minCartValue - totals.subtotal} more to place order`);
  }

  // 3. Snapshot address (delivery only)
  let addressSnapshot = null;
  let zone = null;
  if (fulfillmentType === 'delivery') {
    if (!addressId) throw new ApiError(httpStatus.BAD_REQUEST, 'Address required for delivery');
    const address = await addressService.get(userId, addressId);
    addressSnapshot = address.toJSON();
    zone = await DeliveryZone.findByPincode(address.pincode);
  }

  // 4. Snapshot items
  const items = cart.items.map((i) => ({
    product: i.product,
    variantId: i.variantId,
    name: i.name,
    label: i.label,
    image: i.image,
    qty: i.qty,
    mrp: i.mrp,
    sellingPrice: i.sellingPrice,
  }));

  // 5. Pickup code (if pickup)
  const settings = await Settings.getSingleton();
  const pickupCode = fulfillmentType === 'pickup'
    ? generatePickupCode(settings.fulfillment.pickupCodeLength)
    : null;

  // 6. No COD surcharge — customer pays exactly the cart total
  const grandTotal = totals.total;

  // 7. Razorpay order (skipped for COD)
  let rzpOrder = null;
  if (payment.method !== 'cod') {
    rzpOrder = await razorpay.createOrder({
      amountInr: grandTotal,
      receipt: generateOrderCode(),
    });
  }

  // 8. Create the Order
  const code = generateOrderCode();
  const order = await Order.create({
    code,
    user: userId,
    items,
    itemCount: totals.itemCount,
    fulfillmentType,
    address: addressSnapshot,
    slot,
    zone: zone?._id,
    subtotal: totals.subtotal,
    itemDiscount: totals.itemDiscount,
    coupon: cart.couponCode
      ? {
          code: cart.couponCode,
          discount: cart.couponDiscount,
          couponId: cart.couponMeta?.couponId,
        }
      : undefined,
    deliveryFee: totals.deliveryFee,
    handling: totals.handling,
    packaging: totals.packaging,
    total: grandTotal,
    payment: {
      method: payment.method,
      status: payment.method === 'cod' ? 'pending' : 'pending',
      razorpayOrderId: rzpOrder?.id,
    },
    pickup: fulfillmentType === 'pickup' ? { code: pickupCode } : undefined,
    status: fulfillmentType === 'pickup' ? 'placed' : 'placed',
    timeline: [{ status: 'placed', by: 'system' }],
  });

  // 9. Decrement stock + increment coupon usage + clear cart
  await decrementStock(items);
  if (cart.couponMeta?.couponId) {
    await couponService.incrementUsed(cart.couponMeta.couponId).catch(() => null);
  }
  await cartService.clear(userId);

  return { order, razorpay: rzpOrder };
};

/* ─────────────────── Payment verify ─────────────────── */

const verifyPayment = async (userId, { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  if (String(order.user) !== String(userId)) throw new ApiError(httpStatus.FORBIDDEN, 'Not your order');

  const ok = razorpay.verifySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });
  if (!ok) {
    order.payment.status = 'failed';
    order.payment.failureReason = 'Invalid signature';
    await order.save();
    throw new ApiError(httpStatus.BAD_REQUEST, 'Payment verification failed');
  }
  order.payment.status = 'paid';
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.paidAt = new Date();
  await order.save();
  return order;
};

/* ─────────────────── Reads ─────────────────── */

const getMine = async (userId, id) => {
  const o = await Order.findOne({ _id: id, user: userId }).populate('rider', 'name phone photo vehicle rating');
  if (!o) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  return o;
};

const listMine = (userId, filter = {}) => {
  const q = { user: userId };
  if (filter.status) q.status = filter.status;
  const page = Math.max(1, parseInt(filter.page, 10) || 1);
  const limit = Math.min(50, parseInt(filter.limit, 10) || 20);
  return Order.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
};

/* ─────────────────── Admin: list + detail + state ─────────────────── */

const adminList = async (filter = {}) => {
  const q = {};
  if (filter.status && filter.status !== 'all') q.status = filter.status;
  if (filter.fulfillmentType) q.fulfillmentType = filter.fulfillmentType;
  if (filter.q) q.code = new RegExp(filter.q, 'i');
  const page = Math.max(1, parseInt(filter.page, 10) || 1);
  const limit = Math.min(100, parseInt(filter.limit, 10) || 20);
  const [items, total] = await Promise.all([
    Order.find(q).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('user', 'name phone email')
      .populate('rider', 'name phone photo'),
    Order.countDocuments(q),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
};

const adminGet = async (id) => {
  const o = await Order.findById(id)
    .populate('user', 'name phone email walletBalance')
    .populate('rider', 'name phone photo vehicle rating');
  if (!o) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  return o;
};

const nextStatus = {
  placed: ['packed', 'cancelled'],                      // delivery
  packed: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  preparing: ['ready', 'cancelled'],                     // pickup
  ready: ['picked_up'],
};

const transitionStatus = async (id, newStatus, adminId) => {
  const o = await Order.findById(id);
  if (!o) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  const allowed = nextStatus[o.status] || [];
  if (!allowed.includes(newStatus)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Cannot transition ${o.status} → ${newStatus}`);
  }
  o.status = newStatus;
  o.timeline.push({ status: newStatus, by: String(adminId) });
  if (newStatus === 'ready') o.pickup.readyAt = new Date();
  await o.save();
  return o;
};

const cancel = async (id, reason, adminId, actor = 'admin') => {
  const o = await Order.findById(id);
  if (!o) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  if (['delivered', 'picked_up', 'cancelled'].includes(o.status)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot cancel this order');
  }
  o.status = 'cancelled';
  o.cancelReason = reason || `Cancelled by ${actor}`;
  o.timeline.push({ status: 'cancelled', note: reason, by: String(adminId || actor) });
  await o.save();
  await restoreStock(o.items);
  return o;
};

/* ─────────────────── Pickup flow ─────────────────── */

const startPreparing = async (id) => {
  const o = await Order.findById(id);
  if (!o || o.fulfillmentType !== 'pickup') throw new ApiError(httpStatus.BAD_REQUEST, 'Not a pickup order');
  if (o.status !== 'placed') throw new ApiError(httpStatus.BAD_REQUEST, `Order is ${o.status}`);
  o.status = 'preparing';
  o.timeline.push({ status: 'preparing', by: 'system' });
  await o.save();
  return o;
};

const markReady = async (id, adminId) => {
  const o = await Order.findById(id).populate('user', 'phone name');
  if (!o || o.fulfillmentType !== 'pickup') throw new ApiError(httpStatus.BAD_REQUEST, 'Not a pickup order');
  if (o.status !== 'placed' && o.status !== 'preparing') {
    throw new ApiError(httpStatus.BAD_REQUEST, `Order is ${o.status}`);
  }
  o.status = 'ready';
  o.pickup.readyAt = new Date();
  o.timeline.push({ status: 'ready', by: String(adminId) });
  await o.save();

  // Notify customer
  const settings = await Settings.getSingleton();
  if (settings.fulfillment.autoNotifyOnReady && o.user?.phone) {
    smsService.sendPickupReady(o.user.phone, o.code, o.pickup.code).catch((e) =>
      logger.warn('Pickup notify failed: ' + e.message)
    );
  }
  return o;
};

const verifyPickupCode = async (id, { code, cashCollected }, adminId) => {
  const o = await Order.findById(id);
  if (!o || o.fulfillmentType !== 'pickup') throw new ApiError(httpStatus.BAD_REQUEST, 'Not a pickup order');
  if (o.status !== 'ready') throw new ApiError(httpStatus.BAD_REQUEST, 'Order is not ready');
  if (String(code).trim() !== o.pickup.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Wrong pickup code');
  }
  o.status = 'picked_up';
  o.pickup.pickedUpAt = new Date();
  o.pickup.verifiedBy = adminId;
  o.pickup.cashCollected = cashCollected || 0;
  if (o.payment.method === 'cod' && cashCollected >= o.total) {
    o.payment.status = 'paid';
    o.payment.paidAt = new Date();
  }
  o.timeline.push({ status: 'picked_up', by: String(adminId) });
  await o.save();
  return o;
};

/* ─────────────────── Rider assign ─────────────────── */

const assignRider = async (orderId, riderId, adminId) => {
  const { Rider } = require('../../models');
  const rider = await Rider.findById(riderId);
  if (!rider) throw new ApiError(httpStatus.NOT_FOUND, 'Rider not found');
  const o = await Order.findById(orderId);
  if (!o) throw new ApiError(httpStatus.NOT_FOUND, 'Order not found');
  if (o.fulfillmentType !== 'delivery') throw new ApiError(httpStatus.BAD_REQUEST, 'Order is not for delivery');
  o.rider = rider._id;
  o.riderSnapshot = {
    name: rider.name,
    phone: rider.phone,
    vehicle: rider.vehicle,
    rating: rider.rating,
    photo: rider.photo,
  };
  o.assignedAt = new Date();
  o.timeline.push({ status: `assigned:${rider.name}`, by: String(adminId) });
  await o.save();
  return o;
};

module.exports = {
  createOrder,
  verifyPayment,
  getMine,
  listMine,
  adminList,
  adminGet,
  transitionStatus,
  cancel,
  startPreparing,
  markReady,
  verifyPickupCode,
  assignRider,
};
