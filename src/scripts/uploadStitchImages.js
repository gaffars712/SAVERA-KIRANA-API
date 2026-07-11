/* eslint-disable no-console */
/**
 * Upload the Google Stitch mock images to Cloudinary and patch the DB.
 *
 * The Next.js customer web (SAVERA-KIRANA/src/lib/mockData.js) references
 * Unsplash photo IDs like "photo-1550583724-b2692b85b150" — these were the
 * placeholders from the Stitch design export. This script:
 *
 *   1. Streams each Unsplash photo (auto-optimized JPEG) as a Buffer.
 *   2. Uploads it to Cloudinary under `savera-kirana/products/<slug>`
 *      (or `banners/<slug>` for banner images).
 *   3. Updates the matching Product / Banner document with the
 *      Cloudinary secure_url + public_id.
 *
 * Idempotent — running twice reuses the same public_id so Cloudinary
 * overwrites the existing asset (no duplicates), and skips DB rows that
 * are already pointing at a Cloudinary URL unless --force is passed.
 *
 * Usage:
 *   npm run upload:stitch          # only migrate rows still on Unsplash
 *   npm run upload:stitch -- --force   # re-upload + re-patch everything
 *   npm run upload:stitch -- --only=products    # products only
 *   npm run upload:stitch -- --only=banners     # banners only
 */

const axios = require('axios');
const mongoose = require('mongoose');
const slugify = require('slugify');
const config = require('../config/config');
const { Product, Banner, Category } = require('../models');
const cloudinary = require('../services/cloudinary.service');

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').split('=')[1] || 'all';

/**
 * Product image mapping — slug → Unsplash photo IDs (mirrors mockData.js).
 * Keep in sync when the Stitch mock grows.
 */
const PRODUCT_IMAGES = {
  'aashirvaad-shudh-chakki-atta': [
    { photo: 'photo-1509440159596-0249088772ff', alt: 'Aashirvaad Atta pack front' },
    { photo: 'photo-1568254183919-78a4f43a2877', alt: 'Aashirvaad Atta pack side' },
  ],
  'fortune-sunlite-refined-sunflower-oil': [
    { photo: 'photo-1620558639304-6ba2f26d8fd6', alt: 'Fortune Sunflower Oil bottle' },
  ],
  'amul-gold-full-cream-milk': [
    { photo: 'photo-1550583724-b2692b85b150', alt: 'Amul Gold Milk pouch' },
  ],
  'tata-salt-iodised': [
    { photo: 'photo-1594736797933-d0501ba2fe65', alt: 'Tata Salt pack' },
  ],
  'india-gate-basmati-rice-classic': [
    { photo: 'photo-1586201375761-83865001e31c', alt: 'Basmati rice grains' },
  ],
  'toor-dal-arhar': [
    { photo: 'photo-1596040033229-a9821ebd058d', alt: 'Toor Dal in a bowl' },
  ],
  'amul-butter-salted': [
    { photo: 'photo-1589985270826-4b7bb135bc9d', alt: 'Amul Butter block' },
  ],
  'patanjali-cow-ghee': [
    { photo: 'photo-1631206753348-db44968fd440', alt: 'Cow ghee jar' },
  ],
  'parle-g-original-biscuits': [
    { photo: 'photo-1558961363-fa8fdf82db35', alt: 'Parle-G biscuits' },
  ],
  'haldiram-aloo-bhujia': [
    { photo: 'photo-1600271886742-f049cd451bba', alt: 'Aloo bhujia namkeen' },
  ],
  'fresh-tomatoes': [
    { photo: 'photo-1592924357228-91a4daadcfea', alt: 'Fresh tomatoes' },
  ],
  'fresh-onions': [
    { photo: 'photo-1618512496248-a07fe83aa8cb', alt: 'Fresh onions' },
  ],
  'fresh-bananas-robusta': [
    { photo: 'photo-1571771894821-ce9b6c11b08e', alt: 'Robusta bananas' },
  ],
  'nestle-a-toned-milk': [
    { photo: 'photo-1563636619-e9143da7973b', alt: 'Toned milk carton' },
  ],
  'everest-turmeric-powder': [
    { photo: 'photo-1615485500704-8e990f9900f7', alt: 'Turmeric powder in a bowl' },
  ],
};

const BANNER_IMAGES = {
  'Free delivery on first order': {
    photo: 'photo-1542838132-92c53300491e',
    alt: 'Fresh vegetables on a market table',
  },
  '₹99 minimum order — 90 mins delivery': {
    photo: 'photo-1524594152303-9fd13543fe6e',
    alt: 'Delivery scooter with box',
  },
  // fallback for the Stitch "Artisanal Breads" banner if seeded
  'Artisanal Breads & Daily Dairy': {
    photo: 'photo-1509440159596-0249088772ff',
    alt: 'Fresh bread loaves and milk',
  },
};

const CATEGORY_ICONS = {
  'fruits-and-vegetables': { photo: 'photo-1610348725531-843dff563e2c', alt: 'Fruits & vegetables' },
  'dairy-and-eggs': { photo: 'photo-1550583724-b2692b85b150', alt: 'Dairy & eggs' },
  'atta-and-rice': { photo: 'photo-1509440159596-0249088772ff', alt: 'Atta & rice' },
  'dal-and-pulses': { photo: 'photo-1596040033229-a9821ebd058d', alt: 'Dal & pulses' },
  'oil-ghee-and-masala': { photo: 'photo-1620558639304-6ba2f26d8fd6', alt: 'Oil, ghee & masala' },
  'snacks-and-namkeen': { photo: 'photo-1558961363-fa8fdf82db35', alt: 'Snacks & namkeen' },
  'beverages': { photo: 'photo-1563805042-7684c019e1cb', alt: 'Beverages' },
  'personal-care': { photo: 'photo-1522337360788-8b13dee7a37e', alt: 'Personal care' },
  'household': { photo: 'photo-1583947215259-38e31be8751f', alt: 'Household essentials' },
};

const UNSPLASH_URL = (photoId, w = 1200) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${w}&q=80`;

const isCloudinaryUrl = (u) => typeof u === 'string' && u.includes('res.cloudinary.com');

/**
 * A product image counts as "already migrated" only if it's on Cloudinary AND
 * points at the real per-product folder (not the shared placeholder seeded by
 * seedCatalog.js). This lets the script re-run cleanly after a fresh seed.
 */
const isRealProductImage = (img, slug) =>
  isCloudinaryUrl(img?.url) &&
  !img.url.includes('/placeholders/') &&
  (img.publicId?.includes(slug) || img.url.includes(`/products/${slug}`));

const isRealBannerImage = (b) =>
  isCloudinaryUrl(b?.imageUrl) &&
  !b.imageUrl.includes('/placeholders/') &&
  !!b.imagePublicId;

/**
 * Fetch an Unsplash photo as a Buffer. Retries once on 5xx / network errors.
 */
async function fetchAsBuffer(photoId, width = 1200, tries = 2) {
  const url = UNSPLASH_URL(photoId, width);
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30_000 });
      return Buffer.from(res.data);
    } catch (e) {
      if (attempt === tries) throw e;
      console.warn(`  ↺ retry ${attempt} for ${photoId}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 800));
    }
  }
  return null; // unreachable
}

/**
 * Upload one photo to Cloudinary. The `publicId` is deterministic so re-runs
 * overwrite rather than pile up duplicates.
 */
async function uploadOne({ photo, folder, publicId, tags = [] }) {
  const buffer = await fetchAsBuffer(photo, folder.startsWith('banners') ? 1600 : 900);
  const result = await cloudinary.uploadBuffer(buffer, {
    folder,
    publicId,
    tags: ['stitch-import', ...tags],
  });
  return { url: result.secure_url, publicId: result.public_id };
}

async function migrateProducts() {
  const products = await Product.find({});
  let updated = 0;
  let skipped = 0;

  for (const p of products) {
    const mapping = PRODUCT_IMAGES[p.slug];
    if (!mapping) {
      console.log(`  ⊙ no mapping for ${p.slug} — leaving as-is`);
      skipped++;
      continue;
    }

    const alreadyMigrated = (p.images || []).some((i) => isRealProductImage(i, p.slug));
    if (alreadyMigrated && !FORCE) {
      console.log(`  ✓ ${p.slug} already migrated — skip`);
      skipped++;
      continue;
    }

    console.log(`  ↑ ${p.slug}: uploading ${mapping.length} image(s)…`);
    const uploaded = [];
    for (let i = 0; i < mapping.length; i++) {
      const m = mapping[i];
      try {
        const { url, publicId } = await uploadOne({
          photo: m.photo,
          folder: 'products',
          publicId: `${p.slug}-${i + 1}`,
          tags: ['product', p.slug],
        });
        uploaded.push({ url, publicId, alt: m.alt || p.name });
      } catch (e) {
        console.error(`    ✖ failed to upload ${m.photo}: ${e.message}`);
      }
    }
    if (uploaded.length) {
      p.images = uploaded;
      await p.save();
      updated++;
      console.log(`    ✔ patched ${p.slug} with ${uploaded.length} Cloudinary image(s)`);
    }
  }

  console.log(`\n▸ Products: ${updated} updated, ${skipped} skipped.`);
}

async function migrateBanners() {
  const banners = await Banner.find({});
  let updated = 0;
  let skipped = 0;

  for (const b of banners) {
    const mapping = BANNER_IMAGES[b.title];
    if (!mapping) {
      console.log(`  ⊙ no mapping for banner "${b.title}" — leaving as-is`);
      skipped++;
      continue;
    }
    if (isRealBannerImage(b) && !FORCE) {
      console.log(`  ✓ banner "${b.title}" already migrated — skip`);
      skipped++;
      continue;
    }
    try {
      const slug = slugify(b.title, { lower: true, strict: true });
      const { url, publicId } = await uploadOne({
        photo: mapping.photo,
        folder: 'banners',
        publicId: slug,
        tags: ['banner', b.position || 'home'],
      });
      b.imageUrl = url;
      b.imagePublicId = publicId;
      await b.save();
      console.log(`  ✔ patched banner "${b.title}"`);
      updated++;
    } catch (e) {
      console.error(`  ✖ failed banner "${b.title}": ${e.message}`);
    }
  }

  console.log(`\n▸ Banners: ${updated} updated, ${skipped} skipped.`);
}

async function migrateCategoryIcons() {
  const categories = await Category.find({});
  let updated = 0;
  let skipped = 0;

  for (const c of categories) {
    const mapping = CATEGORY_ICONS[c.slug];
    if (!mapping) {
      skipped++;
      continue;
    }
    if (isCloudinaryUrl(c.iconUrl) && !FORCE) {
      skipped++;
      continue;
    }
    try {
      const { url, publicId } = await uploadOne({
        photo: mapping.photo,
        folder: 'category-icons',
        publicId: c.slug,
        tags: ['category-icon', c.slug],
      });
      c.iconUrl = url;
      // Category model doesn't have a dedicated iconPublicId, reuse imagePublicId.
      c.imagePublicId = publicId;
      await c.save();
      console.log(`  ✔ patched category icon "${c.slug}"`);
      updated++;
    } catch (e) {
      console.error(`  ✖ failed category "${c.slug}": ${e.message}`);
    }
  }

  console.log(`\n▸ Category icons: ${updated} updated, ${skipped} skipped.`);
}

async function run() {
  if (!cloudinary.isConfigured()) {
    console.error('✖ Cloudinary not configured. Check CLOUDINARY_* env vars in .env');
    process.exit(1);
  }

  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  console.log('✔ Connected to MongoDB');
  console.log(`  mode: ${FORCE ? 'FORCE (overwrite all)' : 'INCREMENTAL (skip already-migrated)'}`);
  console.log(`  scope: ${ONLY}\n`);

  if (ONLY === 'all' || ONLY === 'products') {
    console.log('== Products ==');
    await migrateProducts();
  }
  if (ONLY === 'all' || ONLY === 'banners') {
    console.log('\n== Banners ==');
    await migrateBanners();
  }
  if (ONLY === 'all' || ONLY === 'categories') {
    console.log('\n== Category icons ==');
    await migrateCategoryIcons();
  }

  await mongoose.disconnect();
  console.log('\n✔ Done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('✖ Upload failed:', err);
  process.exit(1);
});
