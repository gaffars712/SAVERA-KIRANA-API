/* eslint-disable no-console */
/**
 * P2 smoke test — logs in as super admin and hits the key endpoints end-to-end.
 * Run with:  node src/scripts/smokeTest.js
 */
const axios = require('axios');

const BASE = process.env.SMOKE_BASE || 'http://localhost:4000/v1';
const EMAIL = process.env.SMOKE_EMAIL || 'gaffar@sdlccorp.com';
const PWD = process.env.SMOKE_PWD || 'ChangeMe@123';

async function main() {
  console.log('→ Login as', EMAIL);
  const { data: login } = await axios.post(`${BASE}/auth/admin/login`, { email: EMAIL, password: PWD });
  const token = login.data.tokens.access.token;
  const auth = { Authorization: `Bearer ${token}` };
  console.log('  ✓ logged in as', login.data.admin.name, '(' + login.data.admin.role + ')\n');

  console.log('→ Public category tree');
  const tree = (await axios.get(`${BASE}/public/categories/tree`)).data;
  console.log(`  ✓ ${tree.data.length} root categories`);
  tree.data.forEach((r) => console.log(`    · ${r.name}${r.children.length ? '  ▸ ' + r.children.map((c) => c.name).join(', ') : ''}`));

  console.log('\n→ Public product search (limit 5)');
  const prods = (await axios.get(`${BASE}/public/products?limit=5`)).data;
  console.log(`  ✓ total ${prods.data.total}, showing ${prods.data.items.length}`);
  prods.data.items.forEach((p) => {
    const v = p.variants.find((x) => x.isDefault) || p.variants[0];
    console.log(`    · ${p.name}  →  ${v.label} ₹${v.sellingPrice} (MRP ₹${v.mrp}, min ${v.minOrderQty})`);
  });

  console.log('\n→ Public home feed');
  const home = (await axios.get(`${BASE}/public/home`)).data;
  home.data.sections.forEach((s) => console.log(`  · ${s.title}: ${s.items.length} items`));
  console.log(`  · hero banners: ${home.data.heroBanners.length}`);

  console.log('\n→ Filter: category=atta-and-rice (parent), sort=price_desc');
  const filtered = (await axios.get(`${BASE}/public/products?category=atta-and-rice&sort=price_desc`)).data;
  console.log(`  ✓ ${filtered.data.total} products in Atta & Rice tree`);
  filtered.data.items.forEach((p) => console.log(`  · ${p.name}  starting ₹${p.startingPrice}`));

  console.log('\n→ Search: q=amul');
  const search = (await axios.get(`${BASE}/public/products?q=amul`)).data;
  console.log(`  ✓ ${search.data.total} results`);
  search.data.items.forEach((p) => console.log(`  · ${p.name}`));

  console.log('\n→ Admin: list categories (auth-guarded)');
  const adminCats = (await axios.get(`${BASE}/admin/categories`, { headers: auth })).data;
  console.log(`  ✓ ${adminCats.data.length} categories (incl. subcategories)`);

  console.log('\n→ Fulfillment settings (public)');
  const ff = (await axios.get(`${BASE}/public/fulfillment`)).data;
  console.log(`  ✓ mode: ${ff.data.mode}  |  prep: ${ff.data.pickupPrepTime}min  |  free delivery ≥ ₹${ff.data.delivery.freeDeliveryThreshold}`);

  console.log('\n✔  ALL SMOKE TESTS PASSED');
}

main().catch((e) => {
  console.error('✖ FAILED:', e.response?.status || '', e.response?.data || e.message);
  process.exit(1);
});
