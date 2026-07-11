const httpStatus = require('http-status');
const { Cart, Product, Settings } = require('../../models');
const productService = require('../product/product.service');
const ApiError = require('../../utils/ApiError');

const getCartDoc = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

/** Compute totals + apply coupon + delivery fee based on Settings. */
const computeTotals = async (cart, { fulfillmentType = 'delivery' } = {}) => {
  const settings = await Settings.getSingleton();
  const items = cart.items;
  const itemCount = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.sellingPrice * i.qty, 0);
  const mrpTotal = items.reduce((s, i) => s + i.mrp * i.qty, 0);
  const itemDiscount = mrpTotal - subtotal;

  const couponDiscount = cart.couponDiscount || 0;
  const afterCoupon = Math.max(0, subtotal - couponDiscount);

  let deliveryFee = 0;
  if (fulfillmentType === 'delivery') {
    const s = settings.delivery;
    const isFreeDelivery =
      cart.couponMeta?.type === 'free_delivery' ||
      (afterCoupon >= (s.freeDeliveryThreshold || 0));
    deliveryFee = isFreeDelivery ? 0 : s.defaultFee || 0;
  }

  const handling = settings.delivery.handlingFee || 0;
  const packaging = settings.delivery.packagingFee || 0;
  const total = afterCoupon + deliveryFee + handling + packaging;
  const belowMin = subtotal > 0 && subtotal < (settings.delivery.minCartValue || 0);

  return {
    itemCount,
    mrpTotal,
    subtotal,
    itemDiscount,
    couponDiscount,
    afterCoupon,
    deliveryFee,
    handling,
    packaging,
    total,
    belowMin,
    minCartValue: settings.delivery.minCartValue,
    freeDeliveryThreshold: settings.delivery.freeDeliveryThreshold,
  };
};

const getCart = async (userId, opts = {}) => {
  const cart = await getCartDoc(userId);
  const totals = await computeTotals(cart, opts);
  return { cart: cart.toJSON ? cart.toJSON() : cart, totals };
};

const addItem = async (userId, { productId, variantId, qty = null }) => {
  const product = await Product.findById(productId);
  if (!product || product.status !== 'published') {
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not available');
  }
  const variant = product.variants.id(variantId);
  if (!variant || !variant.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Variant not available');
  }
  const cart = await getCartDoc(userId);
  const existing = cart.items.find(
    (i) => String(i.product) === String(productId) && String(i.variantId) === String(variantId)
  );

  const finalQty = qty ?? variant.minOrderQty ?? 1;
  const desiredQty = existing ? existing.qty + finalQty : finalQty;

  const check = productService.enforceQtyRules(variant, desiredQty);
  if (!check.ok) throw new ApiError(httpStatus.BAD_REQUEST, check.reason);

  if (existing) {
    existing.qty = desiredQty;
  } else {
    cart.items.push({
      product: productId,
      variantId,
      qty: desiredQty,
      name: product.name,
      label: variant.label,
      image: product.images?.[0]?.url || '',
      mrp: variant.mrp,
      sellingPrice: variant.sellingPrice,
      minOrderQty: variant.minOrderQty,
      maxOrderQty: variant.maxOrderQty,
      stepQty: variant.stepQty,
    });
  }
  await cart.save();
  return getCart(userId);
};

const updateItem = async (userId, { variantId, qty }) => {
  const cart = await getCartDoc(userId);
  const line = cart.items.find((i) => String(i.variantId) === String(variantId));
  if (!line) throw new ApiError(httpStatus.NOT_FOUND, 'Item not in cart');

  const product = await Product.findById(line.product);
  const variant = product?.variants.id(variantId);
  if (!variant) throw new ApiError(httpStatus.BAD_REQUEST, 'Variant no longer available');

  if (qty <= 0) {
    cart.items = cart.items.filter((i) => String(i.variantId) !== String(variantId));
  } else {
    const check = productService.enforceQtyRules(variant, qty);
    if (!check.ok) throw new ApiError(httpStatus.BAD_REQUEST, check.reason);
    line.qty = qty;
  }
  await cart.save();
  return getCart(userId);
};

const removeItem = async (userId, variantId) => {
  const cart = await getCartDoc(userId);
  cart.items = cart.items.filter((i) => String(i.variantId) !== String(variantId));
  await cart.save();
  return getCart(userId);
};

const clear = async (userId) => {
  const cart = await getCartDoc(userId);
  cart.items = [];
  cart.couponCode = '';
  cart.couponDiscount = 0;
  cart.couponMeta = {};
  await cart.save();
  return getCart(userId);
};

const setCoupon = async (userId, { code, discount, meta }) => {
  const cart = await getCartDoc(userId);
  cart.couponCode = code || '';
  cart.couponDiscount = discount || 0;
  cart.couponMeta = meta || {};
  await cart.save();
  return cart;
};

const clearCoupon = async (userId) => setCoupon(userId, {});

module.exports = {
  getCartDoc,
  getCart,
  addItem,
  updateItem,
  removeItem,
  clear,
  setCoupon,
  clearCoupon,
  computeTotals,
};
