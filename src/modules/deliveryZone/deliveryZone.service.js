const httpStatus = require('http-status');
const { DeliveryZone } = require('../../models');
const ApiError = require('../../utils/ApiError');

const list = () => DeliveryZone.find().sort({ name: 1 });
const create = (data) => DeliveryZone.create(data);

const get = async (id) => {
  const z = await DeliveryZone.findById(id);
  if (!z) throw new ApiError(httpStatus.NOT_FOUND, 'Zone not found');
  return z;
};

const update = async (id, data) => {
  const z = await get(id);
  Object.assign(z, data);
  await z.save();
  return z;
};

const remove = async (id) => {
  const z = await get(id);
  await z.deleteOne();
  return { deleted: true };
};

/** Public: check if a pincode is serviceable, return zone with slot list. */
const checkServiceability = async (pincode) => {
  const zone = await DeliveryZone.findByPincode(pincode);
  if (!zone) {
    return { serviceable: false, pincode };
  }
  const today = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()];
  const activeSlots = zone.slots
    .filter((s) => s.isActive && (s.activeDays?.length === 0 || s.activeDays.includes(today)))
    .map((s) => ({ id: s._id, label: s.label, start: s.start, end: s.end }));
  return {
    serviceable: true,
    pincode,
    zone: { id: zone._id, name: zone.name },
    deliveryFee: zone.deliveryFee,
    minCartValue: zone.minCartValue,
    freeDeliveryThreshold: zone.freeDeliveryThreshold,
    slots: activeSlots,
  };
};

module.exports = { list, create, get, update, remove, checkServiceability };
