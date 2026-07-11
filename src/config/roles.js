/**
 * Savera Kirana — Roles & Rights
 *
 * Two user collections:
 *  - "customer" lives in the User collection (mobile-first, OTP login)
 *  - "superAdmin" | "storeManager" | "deliveryManager" live in the Admin collection
 */

const CUSTOMER = 'customer';
const SUPER_ADMIN = 'superAdmin';
const STORE_MANAGER = 'storeManager';
const DELIVERY_MANAGER = 'deliveryManager';

const roles = [CUSTOMER, SUPER_ADMIN, STORE_MANAGER, DELIVERY_MANAGER];
const adminRoles = [SUPER_ADMIN, STORE_MANAGER, DELIVERY_MANAGER];

// Rights granted per role. Keep granular — check via `authorize('manageProducts')`.
const roleRights = new Map();

roleRights.set(CUSTOMER, [
  'viewCatalog',
  'manageOwnCart',
  'placeOrder',
  'viewOwnOrders',
  'manageOwnProfile',
  'rateProduct',
]);

roleRights.set(SUPER_ADMIN, [
  // full access — everything below plus admin/settings
  'viewCatalog',
  'manageCatalog',
  'manageInventory',
  'manageOrders',
  'manageCoupons',
  'manageBanners',
  'manageRiders',
  'manageDeliveryZones',
  'assignOrders',
  'viewReports',
  'manageAdmins',
  'manageSettings',
  'managePickupQueue',
]);

roleRights.set(STORE_MANAGER, [
  'viewCatalog',
  'manageCatalog',
  'manageInventory',
  'manageOrders',
  'manageCoupons',
  'manageBanners',
  'managePickupQueue',
  'viewReports',
]);

roleRights.set(DELIVERY_MANAGER, [
  'viewCatalog',
  'manageOrders',
  'manageRiders',
  'manageDeliveryZones',
  'assignOrders',
  'viewReports',
]);

module.exports = {
  roles,
  adminRoles,
  roleRights,
  CUSTOMER,
  SUPER_ADMIN,
  STORE_MANAGER,
  DELIVERY_MANAGER,
};
