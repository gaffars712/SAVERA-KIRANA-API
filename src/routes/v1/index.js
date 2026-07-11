const express = require('express');

const authRoute = require('../../modules/auth/auth.route');
const adminRoute = require('../../modules/admin/admin.route');
const settingsRoute = require('../../modules/settings/settings.route');
const uploadRoute = require('../../modules/upload/upload.route');
const categoryRoute = require('../../modules/category/category.route');
const brandRoute = require('../../modules/brand/brand.route');
const productRoute = require('../../modules/product/product.route');
const bannerRoute = require('../../modules/banner/banner.route');
const publicRoute = require('../../modules/public/public.route');

const addressRoute = require('../../modules/address/address.route');
const cartRoute = require('../../modules/cart/cart.route');
const couponRoutes = require('../../modules/coupon/coupon.route');
const zoneRoutes = require('../../modules/deliveryZone/deliveryZone.route');
const orderRoutes = require('../../modules/order/order.route');
const riderRoute = require('../../modules/rider/rider.route');
const wishlistRoute = require('../../modules/wishlist/wishlist.route');
const waitlistRoute = require('../../modules/waitlist/waitlist.route');
const statsRoute = require('../../modules/stats/stats.route');
const adminUserRoute = require('../../modules/adminUser/adminUser.route');

const router = express.Router();

const routes = [
  // Public
  { path: '/auth', route: authRoute },
  { path: '/public', route: publicRoute },
  { path: '/public/delivery', route: zoneRoutes.publicRouter },
  { path: '/public/coupons', route: couponRoutes.publicRouter },
  { path: '/public/waitlist', route: waitlistRoute },

  // Customer
  { path: '/addresses', route: addressRoute },
  { path: '/cart', route: cartRoute },
  { path: '/cart/coupon', route: couponRoutes.customerRouter },
  { path: '/orders', route: orderRoutes.customerRouter },
  { path: '/wishlist', route: wishlistRoute },

  // Admin (protected)
  { path: '/admin/settings', route: settingsRoute },
  { path: '/admin/admins', route: adminRoute },
  { path: '/admin/upload', route: uploadRoute },
  { path: '/admin/categories', route: categoryRoute },
  { path: '/admin/brands', route: brandRoute },
  { path: '/admin/products', route: productRoute },
  { path: '/admin/banners', route: bannerRoute },
  { path: '/admin/coupons', route: couponRoutes.adminRouter },
  { path: '/admin/delivery-zones', route: zoneRoutes.adminRouter },
  { path: '/admin/orders', route: orderRoutes.adminRouter },
  { path: '/admin/riders', route: riderRoute },
  { path: '/admin/stats', route: statsRoute },
  { path: '/admin/users', route: adminUserRoute },
];

routes.forEach((r) => router.use(r.path, r.route));

router.get('/health', (req, res) =>
  res.json({ success: true, uptime: process.uptime(), env: process.env.NODE_ENV })
);

module.exports = router;
