/* eslint-disable no-console */
const axios = require('axios');
const BASE = 'http://localhost:4000/v1';

async function main() {
  const login = await axios.post(`${BASE}/auth/admin/login`, {
    email: 'gaffar@sdlccorp.com',
    password: 'ChangeMe@123',
  });
  const token = login.data.data.tokens.access.token;
  const H = { headers: { Authorization: `Bearer ${token}` } };

  // Test categories with React Query context (simulate bug)
  console.log('\n→ /admin/categories (no params):');
  const cats = await axios.get(`${BASE}/admin/categories`, H);
  console.log('  success:', cats.data.success, 'count:', cats.data.data?.length);
  cats.data.data?.slice(0, 5).forEach((c) =>
    console.log('  ·', c.name, 'id:', c.id || c._id)
  );

  console.log('\n→ /admin/categories with bogus params (React Query context leak):');
  try {
    const bad = await axios.get(`${BASE}/admin/categories`, {
      ...H,
      params: { queryKey: ['adminCategories'], signal: 'stub' },
    });
    console.log('  count:', bad.data.data?.length, '(if <15 the bug is real)');
  } catch (e) {
    console.log('  ✖ FAILED with 400:', e.response?.data?.message);
  }

  console.log('\n→ /admin/brands:');
  const brs = await axios.get(`${BASE}/admin/brands`, H);
  console.log('  success:', brs.data.success, 'count:', brs.data.data?.length);
  brs.data.data?.slice(0, 5).forEach((b) =>
    console.log('  ·', b.name, 'id:', b.id || b._id)
  );
}

main().catch((e) =>
  console.error('FAIL:', e.response?.status, e.response?.data || e.message)
);
