/* eslint-disable no-console */
const mongoose = require('mongoose');
const config = require('../config/config');
const { Admin, Settings } = require('../models');
const { SUPER_ADMIN } = require('../config/roles');

async function run() {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  console.log('✔  Connected to MongoDB');

  // 1. Seed super admin
  const { name, email, password, phone } = config.seed.superAdmin;
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`ℹ  Super admin already exists: ${existing.email}`);
  } else {
    const admin = await Admin.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: SUPER_ADMIN,
      active: true,
    });
    console.log(`✔  Super admin created: ${admin.email}`);
    console.log(`   Password: ${password}  (change immediately in production)`);
  }

  // 2. Ensure Settings singleton exists
  const settings = await Settings.getSingleton();
  console.log(`✔  Settings ready. Fulfillment mode: ${settings.fulfillment.mode}`);

  await mongoose.disconnect();
  console.log('✔  Done');
  process.exit(0);
}

run().catch((err) => {
  console.error('✖  Seeder failed:', err);
  process.exit(1);
});
