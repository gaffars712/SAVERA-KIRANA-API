/* eslint-disable no-console */
const mongoose = require('mongoose');
const slugify = require('slugify');
const config = require('../config/config');
const { Category, Brand, Product, Banner } = require('../models');

const CATEGORIES = [
  { name: 'Fruits & Vegetables', order: 1, isFeatured: true, iconUrl: 'https://res.cloudinary.com/xmldtlpy/image/upload/v1/savera-kirana/icons/fruits.png' },
  { name: 'Dairy & Eggs', order: 2, isFeatured: true },
  { name: 'Atta & Rice', order: 3, isFeatured: true,
    children: [
      { name: 'Atta & Flours', order: 1 },
      { name: 'Rice', order: 2 },
    ],
  },
  { name: 'Dal & Pulses', order: 4, isFeatured: true },
  { name: 'Oil, Ghee & Masala', order: 5, isFeatured: true,
    children: [
      { name: 'Cooking Oil', order: 1 },
      { name: 'Ghee', order: 2 },
      { name: 'Masala & Spices', order: 3 },
    ],
  },
  { name: 'Snacks & Namkeen', order: 6 },
  { name: 'Beverages', order: 7 },
  { name: 'Personal Care', order: 8 },
  { name: 'Household', order: 9 },
];

const BRANDS = [
  'Aashirvaad', 'Fortune', 'Tata', 'Amul', 'Nestle', 'Britannia',
  'Parle', 'Haldiram', 'Patanjali', 'Mother Dairy', 'Dabur', 'Everest',
];

const stock = 100;

const PRODUCTS = [
  {
    name: 'Aashirvaad Shudh Chakki Atta',
    brand: 'Aashirvaad', category: 'Atta & Flours',
    shortDescription: '100% Whole Wheat, no maida, 0% additives',
    highlights: ['100% Whole Wheat', 'No additives', 'Traditional chakki-ground'],
    variants: [
      { unit: 'kg', value: 5, mrp: 410, sellingPrice: 315, stock, minOrderQty: 1, maxOrderQty: 5, isDefault: true, sku: 'AASH-ATTA-5KG' },
      { unit: 'kg', value: 10, mrp: 780, sellingPrice: 615, stock, minOrderQty: 1, maxOrderQty: 3, sku: 'AASH-ATTA-10KG' },
    ],
    isFeatured: true, isBestseller: true,
  },
  {
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune', category: 'Cooking Oil',
    shortDescription: 'Light on stomach, heart friendly',
    variants: [
      { unit: 'l', value: 1, mrp: 210, sellingPrice: 175, stock, minOrderQty: 1, isDefault: true, sku: 'FORT-SUN-1L' },
      { unit: 'l', value: 5, mrp: 1050, sellingPrice: 899, stock, minOrderQty: 1, maxOrderQty: 2, sku: 'FORT-SUN-5L' },
    ],
    isFeatured: true,
  },
  {
    name: 'Amul Gold Full Cream Milk',
    brand: 'Amul', category: 'Dairy & Eggs',
    shortDescription: 'Rich, thick and creamy — 6% fat',
    variants: [
      { unit: 'ml', value: 500, mrp: 34, sellingPrice: 34, stock, minOrderQty: 2, maxOrderQty: 20, isDefault: true, sku: 'AMUL-GOLD-500' },
      { unit: 'l', value: 1, mrp: 68, sellingPrice: 68, stock, minOrderQty: 1, maxOrderQty: 10, sku: 'AMUL-GOLD-1L' },
    ],
    isBestseller: true,
  },
  {
    name: 'Tata Salt Iodised',
    brand: 'Tata', category: 'Masala & Spices',
    variants: [
      { unit: 'kg', value: 1, mrp: 30, sellingPrice: 28, stock, minOrderQty: 1, isDefault: true, sku: 'TATA-SALT-1KG' },
    ],
  },
  {
    name: 'India Gate Basmati Rice Classic',
    brand: 'Aashirvaad', category: 'Rice',
    shortDescription: 'Long grain, aged premium basmati',
    variants: [
      { unit: 'kg', value: 1, mrp: 260, sellingPrice: 220, stock, minOrderQty: 1, isDefault: true, sku: 'IG-BASMATI-1' },
      { unit: 'kg', value: 5, mrp: 1200, sellingPrice: 1040, stock, minOrderQty: 1, maxOrderQty: 3, sku: 'IG-BASMATI-5' },
    ],
    isFeatured: true,
  },
  {
    name: 'Toor Dal (Arhar)',
    brand: 'Tata', category: 'Dal & Pulses',
    variants: [
      { unit: 'kg', value: 1, mrp: 180, sellingPrice: 155, stock, minOrderQty: 1, isDefault: true, sku: 'TOORDAL-1KG' },
    ],
    isBestseller: true,
  },
  {
    name: 'Amul Butter Salted',
    brand: 'Amul', category: 'Dairy & Eggs',
    variants: [
      { unit: 'g', value: 100, mrp: 62, sellingPrice: 58, stock, minOrderQty: 1, isDefault: true, sku: 'AMUL-BUTTER-100' },
      { unit: 'g', value: 500, mrp: 275, sellingPrice: 260, stock, minOrderQty: 1, sku: 'AMUL-BUTTER-500' },
    ],
  },
  {
    name: 'Patanjali Cow Ghee',
    brand: 'Patanjali', category: 'Ghee',
    variants: [
      { unit: 'l', value: 1, mrp: 650, sellingPrice: 570, stock, minOrderQty: 1, isDefault: true, sku: 'PAT-GHEE-1L' },
    ],
    isFeatured: true,
  },
  {
    name: 'Everest Turmeric Powder',
    brand: 'Everest', category: 'Masala & Spices',
    variants: [
      { unit: 'g', value: 100, mrp: 40, sellingPrice: 36, stock, minOrderQty: 1, isDefault: true, sku: 'EVR-HALDI-100' },
      { unit: 'g', value: 500, mrp: 190, sellingPrice: 170, stock, minOrderQty: 1, sku: 'EVR-HALDI-500' },
    ],
  },
  {
    name: 'Parle-G Original Biscuits',
    brand: 'Parle', category: 'Snacks & Namkeen',
    variants: [
      { unit: 'g', value: 250, mrp: 30, sellingPrice: 28, stock, minOrderQty: 2, maxOrderQty: 20, isDefault: true, sku: 'PARLE-G-250' },
    ],
    isBestseller: true,
  },
  {
    name: 'Haldiram Aloo Bhujia',
    brand: 'Haldiram', category: 'Snacks & Namkeen',
    variants: [
      { unit: 'g', value: 200, mrp: 75, sellingPrice: 70, stock, minOrderQty: 1, isDefault: true, sku: 'HALDI-ABHU-200' },
    ],
  },
  {
    name: 'Fresh Tomatoes',
    brand: null, category: 'Fruits & Vegetables',
    isVeg: true,
    variants: [
      { unit: 'kg', value: 1, mrp: 40, sellingPrice: 35, stock, minOrderQty: 1, stepQty: 1, isDefault: true, sku: 'VEG-TOMATO-1' },
    ],
  },
  {
    name: 'Fresh Onions',
    brand: null, category: 'Fruits & Vegetables',
    variants: [
      { unit: 'kg', value: 1, mrp: 45, sellingPrice: 38, stock, minOrderQty: 1, isDefault: true, sku: 'VEG-ONION-1' },
    ],
  },
  {
    name: 'Fresh Bananas Robusta',
    brand: null, category: 'Fruits & Vegetables',
    variants: [
      { unit: 'dozen', value: 1, mrp: 60, sellingPrice: 55, stock, minOrderQty: 1, isDefault: true, sku: 'FRT-BANANA-DZ' },
    ],
  },
  {
    name: 'Nestle a+ Toned Milk',
    brand: 'Nestle', category: 'Dairy & Eggs',
    variants: [
      { unit: 'l', value: 1, mrp: 68, sellingPrice: 65, stock, minOrderQty: 2, isDefault: true, sku: 'NEST-MILK-1L' },
    ],
  },
];

const BANNERS = [
  {
    title: 'Free delivery on first order',
    subtitle: 'Above ₹199 — use code WELCOME',
    imageUrl: 'https://res.cloudinary.com/xmldtlpy/image/upload/w_1200,q_auto,f_auto/v1/savera-kirana/banners/welcome.jpg',
    position: 'home_hero',
    order: 1,
    linkType: 'url',
    linkUrl: '/offers/welcome',
    ctaText: 'Shop now',
    isActive: true,
  },
  {
    title: '₹99 minimum order — 90 mins delivery',
    imageUrl: 'https://res.cloudinary.com/xmldtlpy/image/upload/w_1200,q_auto,f_auto/v1/savera-kirana/banners/express.jpg',
    position: 'home_hero',
    order: 2,
    isActive: true,
  },
];

async function run() {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  console.log('✔  Connected to MongoDB');

  // Categories (with children)
  const catMap = new Map();
  for (const c of CATEGORIES) {
    const slug = slugify(c.name, { lower: true, strict: true });
    let doc = await Category.findOne({ slug });
    if (!doc) {
      doc = await Category.create({
        name: c.name,
        slug,
        order: c.order || 0,
        isFeatured: !!c.isFeatured,
        iconUrl: c.iconUrl || '',
        isActive: true,
      });
      console.log(`  + category: ${c.name}`);
    }
    catMap.set(c.name, doc);

    if (c.children) {
      for (const child of c.children) {
        const childSlug = slugify(child.name, { lower: true, strict: true });
        let childDoc = await Category.findOne({ slug: childSlug });
        if (!childDoc) {
          childDoc = await Category.create({
            name: child.name,
            slug: childSlug,
            order: child.order || 0,
            parent: doc._id,
            ancestors: [{ _id: doc._id, name: doc.name, slug: doc.slug }],
            isActive: true,
          });
          console.log(`    + subcategory: ${child.name}`);
        }
        catMap.set(child.name, childDoc);
      }
    }
  }

  // Brands
  const brandMap = new Map();
  for (const name of BRANDS) {
    const slug = slugify(name, { lower: true, strict: true });
    let doc = await Brand.findOne({ slug });
    if (!doc) {
      doc = await Brand.create({ name, slug, isActive: true, isFeatured: true });
      console.log(`  + brand: ${name}`);
    }
    brandMap.set(name, doc);
  }

  // Products
  let created = 0;
  for (const p of PRODUCTS) {
    const slug = slugify(p.name, { lower: true, strict: true });
    if (await Product.exists({ slug })) continue;

    const category = catMap.get(p.category);
    if (!category) {
      console.warn(`  ! missing category: ${p.category} — skipping ${p.name}`);
      continue;
    }
    const brand = p.brand ? brandMap.get(p.brand) : null;

    // Set first variant as default if none
    const variants = p.variants.map((v, i) => ({ ...v, isDefault: v.isDefault || i === 0 }));

    await Product.create({
      name: p.name,
      slug,
      shortDescription: p.shortDescription || '',
      description: p.description || p.shortDescription || '',
      brand: brand?._id,
      category: category._id,
      categoryPath: [...category.ancestors.map((a) => a._id), category._id],
      isVeg: p.isVeg !== false,
      gstSlab: 5,
      images: [{
        url: `https://res.cloudinary.com/xmldtlpy/image/upload/w_600,q_auto,f_auto/v1/savera-kirana/placeholders/product.png`,
        alt: p.name,
      }],
      variants,
      highlights: p.highlights || [],
      tags: [p.category.toLowerCase(), p.brand?.toLowerCase()].filter(Boolean),
      status: 'published',
      publishedAt: new Date(),
      isFeatured: !!p.isFeatured,
      isBestseller: !!p.isBestseller,
    });
    await Category.updateOne({ _id: category._id }, { $inc: { productCount: 1 } });
    console.log(`  + product: ${p.name}`);
    created++;
  }

  // Banners
  for (const b of BANNERS) {
    const exists = await Banner.exists({ title: b.title, position: b.position });
    if (!exists) {
      await Banner.create(b);
      console.log(`  + banner: ${b.title}`);
    }
  }

  console.log(`\n✔  Catalog seeded. ${created} new products.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('✖  Catalog seed failed:', err);
  process.exit(1);
});
