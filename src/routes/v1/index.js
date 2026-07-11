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

const router = express.Router();

const routes = [
  { path: '/auth', route: authRoute },

  // Admin (protected) — mounted under /admin/*
  { path: '/admin/settings', route: settingsRoute },
  { path: '/admin/admins', route: adminRoute },
  { path: '/admin/upload', route: uploadRoute },
  { path: '/admin/categories', route: categoryRoute },
  { path: '/admin/brands', route: brandRoute },
  { path: '/admin/products', route: productRoute },
  { path: '/admin/banners', route: bannerRoute },

  // Public (no auth) — mounted under /public/*
  { path: '/public', route: publicRoute },
];

routes.forEach((r) => router.use(r.path, r.route));

router.get('/health', (req, res) =>
  res.json({ success: true, uptime: process.uptime(), env: process.env.NODE_ENV })
);

module.exports = router;
