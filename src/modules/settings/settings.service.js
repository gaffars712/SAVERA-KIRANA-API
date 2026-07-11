const { Settings } = require('../../models');

const getSettings = async () => Settings.getSingleton();

const updateSettings = async (patch) => {
  const doc = await Settings.getSingleton();
  // deep merge each top-level key
  ['store', 'fulfillment', 'delivery', 'payment', 'tax'].forEach((k) => {
    if (patch[k]) doc[k] = { ...doc[k].toObject?.() || doc[k], ...patch[k] };
  });
  await doc.save();
  return doc;
};

const getPublicFulfillment = async () => {
  const s = await Settings.getSingleton();
  return {
    mode: s.fulfillment.mode,
    pickupPrepTime: s.fulfillment.pickupPrepTime,
    pickupInstructions: s.fulfillment.pickupInstructions,
    store: {
      name: s.store.name,
      address: s.store.address,
      location: s.store.location,
      phone: s.store.phone,
      openHours: s.store.openHours,
    },
    delivery: {
      defaultFee: s.delivery.defaultFee,
      freeDeliveryThreshold: s.delivery.freeDeliveryThreshold,
      minCartValue: s.delivery.minCartValue,
    },
    payment: {
      codEnabled: s.payment.codEnabled,
      codLimit: s.payment.codLimit,
      walletEnabled: s.payment.walletEnabled,
    },
  };
};

module.exports = { getSettings, updateSettings, getPublicFulfillment };
