/**
 * Public catalog routes — no auth. Used by customer web + mobile.
 * Only published products are exposed.
 */
const express = require('express');
const validate = require('../../middlewares/validate');
const catchAsync = require('../../utils/catchAsync');

const categoryService = require('../category/category.service');
const productService = require('../product/product.service');
const brandService = require('../brand/brand.service');
const bannerService = require('../banner/banner.service');
const settingsService = require('../settings/settings.service');

const categoryValidation = require('../category/category.validation');
const productValidation = require('../product/product.validation');
const bannerValidation = require('../banner/banner.validation');

const router = express.Router();

/* ── Fulfillment (customer apps read on launch) ── */
router.get(
  '/fulfillment',
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await settingsService.getPublicFulfillment() });
  })
);

/* ── Categories ── */
router.get(
  '/categories',
  validate(categoryValidation.list),
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await categoryService.list({ ...req.query, isActive: true }) });
  })
);
router.get(
  '/categories/tree',
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await categoryService.tree() });
  })
);
router.get(
  '/categories/:slug',
  validate(categoryValidation.bySlug),
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await categoryService.getBySlug(req.params.slug) });
  })
);

/* ── Brands ── */
router.get(
  '/brands',
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await brandService.list({ ...req.query, isActive: true }) });
  })
);

/* ── Products ── */
router.get(
  '/products',
  validate(productValidation.list),
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await productService.search(req.query, { isPublic: true }) });
  })
);
router.get(
  '/products/:slug',
  validate(productValidation.bySlug),
  catchAsync(async (req, res) => {
    const p = await productService.getBySlug(req.params.slug);
    if (p.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: p });
  })
);

/* ── Banners ── */
router.get(
  '/banners',
  validate(bannerValidation.list),
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await bannerService.listPublic(req.query.position) });
  })
);

/* ── Home feed (aggregated for the mobile app in one call) ── */
router.get(
  '/home',
  catchAsync(async (req, res) => {
    const [tree, heroBanners, stripBanners, featured, bestsellers, newest] = await Promise.all([
      categoryService.tree(),
      bannerService.listPublic('home_hero'),
      bannerService.listPublic('home_strip'),
      productService.search({ featured: true, limit: 12 }, { isPublic: true }),
      productService.search({ bestseller: true, limit: 12 }, { isPublic: true }),
      productService.search({ sort: 'newest', limit: 12 }, { isPublic: true }),
    ]);
    res.json({
      success: true,
      data: {
        categories: tree,
        heroBanners,
        stripBanners,
        sections: [
          { key: 'featured', title: 'Deal of the day', items: featured.items },
          { key: 'bestsellers', title: 'Bestsellers in your area', items: bestsellers.items },
          { key: 'newest', title: 'Newly added', items: newest.items },
        ],
      },
    });
  })
);

module.exports = router;
