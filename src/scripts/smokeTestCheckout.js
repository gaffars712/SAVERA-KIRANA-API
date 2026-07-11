/* eslint-disable no-console */
/**
 * End-to-end P6 smoke test.
 * - Issues a customer OTP → verifies → gets a customer JWT
 * - Adds an address
 * - Adds items to cart → applies a coupon
 * - Places a PICKUP order → admin logs in → mark ready → verify code
 * - Places a DELIVERY order (COD) → admin assigns rider → transitions status
 *
 * Run:  node src/scripts/smokeTestCheckout.js
 */
const axios = require('axios');

const BASE = process.env.SMOKE_BASE || 'http://localhost:4000/v1';
const ADMIN_EMAIL = process.env.SMOKE_EMAIL || 'gaffar@sdlccorp.com';
const ADMIN_PWD = process.env.SMOKE_PWD || 'ChangeMe@123';
const TEST_PHONE = '+919000000001';

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const grey = (s) => `\x1b[90m${s}\x1b[0m`;

async function main() {
  /* ── 1. Admin login ── */
  console.log('\n→ Admin login');
  const adminLogin = (await axios.post(`${BASE}/auth/admin/login`, { email: ADMIN_EMAIL, password: ADMIN_PWD })).data;
  const adminToken = adminLogin.data.tokens.access.token;
  const adminH = { headers: { Authorization: `Bearer ${adminToken}` } };
  console.log(green('  ✓'), adminLogin.data.admin.name, `(${adminLogin.data.admin.role})`);

  /* ── 2. Seed a delivery zone + a coupon (idempotent) ── */
  console.log('\n→ Seeding zone + coupon (idempotent)');
  const zones = (await axios.get(`${BASE}/admin/delivery-zones`, adminH)).data.data;
  let zone = zones.find((z) => z.pincodes.includes('302017'));
  if (!zone) {
    zone = (await axios.post(`${BASE}/admin/delivery-zones`, {
      name: 'Malviya Nagar',
      pincodes: ['302017', '302018'],
      deliveryFee: 20,
      freeDeliveryThreshold: 499,
      minCartValue: 99,
      slots: [
        { label: '4 - 6 PM', start: '16:00', end: '18:00' },
        { label: '6 - 8 PM', start: '18:00', end: '20:00' },
      ],
    }, adminH)).data.data;
    console.log(green('  + zone created:'), zone.name);
  } else {
    console.log(grey('  = zone exists:'), zone.name);
  }

  const coupons = (await axios.get(`${BASE}/admin/coupons`, adminH)).data.data;
  let coupon = coupons.find((c) => c.code === 'SMOKE50');
  const couponPayload = {
    code: 'SMOKE50', title: 'Flat 30 off', type: 'flat', value: 30, minCart: 50,
    isActive: true, usageLimitPerUser: 999,
  };
  if (!coupon) {
    coupon = (await axios.post(`${BASE}/admin/coupons`, couponPayload, adminH)).data.data;
    console.log(green('  + coupon created:'), coupon.code);
  } else {
    // Ensure fresh values
    coupon = (await axios.patch(`${BASE}/admin/coupons/${coupon.id || coupon._id}`, {
      minCart: 50, value: 30, isActive: true,
    }, adminH)).data.data;
    console.log(grey('  = coupon refreshed:'), coupon.code);
  }

  /* ── 3. Customer OTP flow ── */
  console.log('\n→ Customer OTP request (test phone', TEST_PHONE + ')');
  const otpReq = (await axios.post(`${BASE}/auth/otp/request`, { phone: TEST_PHONE })).data;
  console.log(green('  ✓ OTP sent · devOtp:'), otpReq.data.devOtp);
  const otpVer = (await axios.post(`${BASE}/auth/otp/verify`, {
    phone: TEST_PHONE,
    otp: otpReq.data.devOtp,
    name: 'Smoke Test User',
  })).data;
  const custToken = otpVer.data.tokens.access.token;
  const custH = { headers: { Authorization: `Bearer ${custToken}` } };
  console.log(green('  ✓ Customer logged in:'), otpVer.data.user.name);

  /* ── 4. Add address ── */
  console.log('\n→ Add customer address');
  const address = (await axios.post(`${BASE}/addresses`, {
    tag: 'Home',
    name: 'Smoke Test User',
    phone: TEST_PHONE,
    line1: 'B-402, Sunrise Apartments',
    line2: 'Malviya Nagar',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302017',
  }, custH)).data.data;
  console.log(green('  ✓ Address:'), address.line1);

  /* ── 5. Pincode serviceability ── */
  console.log('\n→ Check serviceability');
  const svc = (await axios.get(`${BASE}/public/delivery/serviceability?pincode=302017`)).data;
  console.log(green('  ✓ Serviceable:'), svc.data.serviceable, '· slots:', svc.data.slots?.length);

  /* ── 6. Add items to cart ── */
  console.log('\n→ Add items to cart');
  const prods = (await axios.get(`${BASE}/public/products?limit=3&sort=newest`)).data.data;
  const buyable = prods.items.filter((p) => p.variants.some((v) => (v.minOrderQty || 1) === 1)).slice(0, 2);
  if (buyable.length === 0) {
    console.log(red('  ✖ no min-1 products, using first products'));
    buyable.push(...prods.items.slice(0, 2));
  }
  for (const p of buyable) {
    const v = p.variants.find((x) => x.isDefault) || p.variants[0];
    const added = (await axios.post(`${BASE}/cart/items`, {
      productId: p.id || p._id,
      variantId: v._id || v.id,
      qty: v.minOrderQty || 1,
    }, custH)).data.data;
    console.log(green('  + added:'), p.name, `${v.label} × ${v.minOrderQty || 1}`, '→ cart total ₹' + added.totals.total);
  }

  /* ── 7. Apply coupon ── */
  console.log('\n→ Apply coupon SMOKE50');
  const coup = (await axios.post(`${BASE}/cart/coupon/apply`, { code: 'SMOKE50' }, custH)).data.data;
  console.log(green('  ✓ Applied — discount:'), '₹' + coup.totals.couponDiscount, '· total:', '₹' + coup.totals.total);

  /* ── 8. Place PICKUP order ── */
  console.log('\n→ Place PICKUP order (COD)');
  const pickupOrder = (await axios.post(`${BASE}/orders`, {
    fulfillmentType: 'pickup',
    slot: 'ASAP',
    payment: { method: 'cod' },
  }, custH)).data.data;
  console.log(green('  ✓ Order placed:'), pickupOrder.order.code, '· pickup code:', pickupOrder.order.pickup?.code);
  const pickupOrderId = pickupOrder.order._id || pickupOrder.order.id;

  /* ── 9. Admin: mark ready + verify pickup code ── */
  console.log('\n→ Admin: mark pickup order as READY');
  const ready = (await axios.post(`${BASE}/admin/orders/${pickupOrderId}/ready`, {}, adminH)).data.data;
  console.log(green('  ✓ Status:'), ready.status);

  console.log('\n→ Admin: verify pickup with WRONG code');
  try {
    await axios.post(`${BASE}/admin/orders/${pickupOrderId}/verify-pickup`, {
      code: '0000',
    }, adminH);
    console.log(red('  ✖ SHOULD HAVE FAILED'));
  } catch (e) {
    console.log(green('  ✓ Rejected wrong code:'), e.response?.data?.message);
  }

  console.log('\n→ Admin: verify pickup with CORRECT code');
  const verified = (await axios.post(`${BASE}/admin/orders/${pickupOrderId}/verify-pickup`, {
    code: pickupOrder.order.pickup.code,
    cashCollected: pickupOrder.order.total,
  }, adminH)).data.data;
  console.log(green('  ✓ Status:'), verified.status, '· payment:', verified.payment.status);

  /* ── 10. Add new items → place DELIVERY order ── */
  console.log('\n→ Add items again for delivery order');
  // Add enough items to clear global min-cart (₹99)
  const bigProds = (await axios.get(`${BASE}/public/products?limit=10&sort=price_desc`)).data.data.items;
  const pricyBuyable = bigProds.filter((p) => (p.variants[0].minOrderQty || 1) === 1).slice(0, 2);
  for (const p of pricyBuyable) {
    const v = p.variants.find((x) => x.isDefault) || p.variants[0];
    const r = (await axios.post(`${BASE}/cart/items`, {
      productId: p.id || p._id,
      variantId: v._id || v.id,
      qty: 1,
    }, custH)).data.data;
    console.log(grey('  · added:'), p.name, '→ subtotal ₹' + r.totals.subtotal);
  }

  console.log('\n→ Place DELIVERY order (COD)');
  const delOrder = (await axios.post(`${BASE}/orders`, {
    fulfillmentType: 'delivery',
    addressId: address._id || address.id,
    slot: 'Today · 4-6 PM',
    payment: { method: 'cod' },
  }, custH)).data.data;
  console.log(green('  ✓ Order placed:'), delOrder.order.code);
  const delOrderId = delOrder.order._id || delOrder.order.id;

  /* ── 11. Ensure a rider exists, assign, transition to delivered ── */
  console.log('\n→ Admin: ensure a rider exists');
  let riders = (await axios.get(`${BASE}/admin/riders`, adminH)).data.data;
  let rider = riders[0];
  if (!rider) {
    rider = (await axios.post(`${BASE}/admin/riders`, {
      name: 'Smoke Rider',
      phone: '+919000000099',
      vehicle: 'RJ-14 SC 0001',
      vehicleType: 'bike',
      status: 'online',
    }, adminH)).data.data;
    console.log(green('  + rider created:'), rider.name);
  } else {
    console.log(grey('  = rider exists:'), rider.name);
  }

  console.log('\n→ Admin: assign rider to delivery order');
  const assigned = (await axios.post(`${BASE}/admin/orders/${delOrderId}/assign-rider`, {
    riderId: rider._id || rider.id,
  }, adminH)).data.data;
  console.log(green('  ✓ Rider assigned:'), assigned.riderSnapshot?.name);

  console.log('\n→ Admin: transition placed → packed → out_for_delivery → delivered');
  for (const s of ['packed', 'out_for_delivery', 'delivered']) {
    const r = (await axios.post(`${BASE}/admin/orders/${delOrderId}/status`, { status: s }, adminH)).data.data;
    console.log(green('  ✓'), '→ ' + r.status);
  }

  /* ── 12. Customer: list orders ── */
  console.log('\n→ Customer: list my orders');
  const mine = (await axios.get(`${BASE}/orders`, custH)).data.data;
  mine.forEach((o) => console.log('  ·', o.code, '·', o.fulfillmentType, '·', o.status, '· ₹' + o.total));

  console.log(green('\n✔  P6 CHECKOUT SMOKE TEST PASSED\n'));
}

main().catch((e) => {
  console.error(red('\n✖ FAILED:'), e.response?.status || '', e.response?.data || e.message);
  if (e.response?.data?.stack) console.error(e.response.data.stack);
  process.exit(1);
});
