# Savera Kirana — API

Node.js + Express + MongoDB backend for the Savera Kirana grocery e-commerce platform.

Sibling repos:
- `SAVERA-KIRANA` — Next.js customer web
- `SAVERA-KIRANA-ADMIN` — Vite + React admin panel
- `SAVERA-KIRANA-NATIVEAPK` — React Native customer app (later phase)

## Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env      # then edit MONGODB_URL, JWT_SECRET, admin creds

# 3. Seed the super admin + settings singleton
npm run seed:super-admin

# 4. Run dev server
npm run dev               # http://localhost:4000
```

Health: `GET http://localhost:4000/v1/health`

## What ships in Phase 1 (this snapshot)

### Authentication
- **Customer**: OTP-based login on phone (6-digit, 5-min TTL, 5-attempt cap).
  In `NODE_ENV=development` OTPs are printed to the server console
  and returned in the API response as `devOtp` for easy testing.
- **Admin**: email + password + JWT, with 3 admin roles + 1 customer role.
- Access + refresh token pair. JWT payload carries `{sub, role, type}`.

### Roles
| Role | Rights |
|---|---|
| `customer` | catalog, own cart/orders/profile |
| `superAdmin` | everything + manage admins + manage settings |
| `storeManager` | catalog, inventory, orders, coupons, pickup queue |
| `deliveryManager` | orders, riders, zones, assign |

Role-guard usage in routes:

```js
const auth = require('../middlewares/auth');
const { requireRole } = require('../middlewares/auth');

router.get(
  '/riders',
  auth('manageRiders'),                          // check rights
  requireRole('superAdmin', 'deliveryManager'),  // restrict by role
  handler
);
```

### Settings (Super Admin only)
- Store info (name, GSTIN, FSSAI, address, phone, hours, photos)
- **Fulfillment mode toggle**: `delivery` | `pickup` | `both`
- Pickup config: prep time, code length (4 or 6), auto-notify, allow manual call
- Delivery config: fee, free threshold, min cart
- Payment: COD toggle + limit, Razorpay, wallet

Public endpoint for the customer apps to read the current mode:

```
GET /v1/public/fulfillment
```

## API surface (Phase 1)

```
Auth
  POST   /v1/auth/otp/request           { phone }
  POST   /v1/auth/otp/verify            { phone, otp, name? }
  POST   /v1/auth/admin/login           { email, password }
  POST   /v1/auth/refresh               { refreshToken }
  GET    /v1/auth/me                    (Bearer)

Admin management  (superAdmin only)
  GET    /v1/admin/admins?q&role&active&page&limit
  GET    /v1/admin/admins/:id
  POST   /v1/admin/admins               { name, email, phone?, password, role }
  PATCH  /v1/admin/admins/:id
  POST   /v1/admin/admins/:id/deactivate
  POST   /v1/admin/admins/:id/activate

Settings  (superAdmin only)
  GET    /v1/admin/settings
  PATCH  /v1/admin/settings             partial update, deep-merged

Public
  GET    /v1/public/fulfillment
  GET    /v1/health
```

## Env vars

See `.env.example`. Only two are strictly required in dev:

- `MONGODB_URL` (e.g. `mongodb://127.0.0.1:27017/savera-kirana`)
- `JWT_SECRET` (any long random string)

Twilio / Razorpay / AWS S3 are all optional in development. When Twilio isn't
configured, OTPs are logged to the console and returned in the response body
as `devOtp` so you can test the flow without a real SMS provider.

## Project structure

```
src/
├── app.js                     Express app + middlewares
├── index.js                   Boot (mongo connect + listen)
├── config/
│   ├── config.js              env schema + typed config object
│   ├── roles.js               roles + rights map
│   ├── passport.js            JWT strategy (customer & admin)
│   ├── logger.js
│   ├── morgan.js
│   └── tokens.js
├── middlewares/
│   ├── auth.js                auth() + requireRole() + requireAdmin
│   ├── error.js
│   ├── rateLimiter.js
│   └── validate.js            Joi schema validator
├── models/
│   ├── user.model.js          customers
│   ├── admin.model.js         3 admin roles
│   ├── otp.model.js           TTL-indexed OTPs
│   ├── settings.model.js      singleton store + fulfillment config
│   └── token.model.js
├── modules/
│   ├── auth/                  route + controller + service + validation
│   ├── admin/                 sub-admin CRUD
│   └── settings/              store + fulfillment mgmt
├── services/
│   └── sms.service.js         Twilio wrapper with dev fallback
├── scripts/
│   └── seedSuperAdmin.js      creates the first super admin + settings
└── routes/v1/index.js         route composition
```

## Phase 2 (Catalog) — shipped ✅

Cloudinary image hosting (25 GB free), Categories (tree), Brands, Products with
weight variants + **minOrderQty / maxOrderQty / stepQty**, Banners with schedule
+ position, and full public-facing catalog for the customer apps.

### Extra API surface

```
Uploads (admin only)
  POST   /v1/admin/upload            multipart file → Cloudinary  (returns {url,publicId,...})
  POST   /v1/admin/upload/multi      up to 8 files
  POST   /v1/admin/upload/delete     { publicId }

Categories (admin)
  GET    /v1/admin/categories?q&parent&isActive
  GET    /v1/admin/categories/tree
  POST   /v1/admin/categories
  PATCH  /v1/admin/categories/:id
  DELETE /v1/admin/categories/:id

Brands (admin)   GET/POST/PATCH/DELETE  /v1/admin/brands

Products (admin)
  GET    /v1/admin/products?q&category&brand&minPrice&maxPrice&sort&status&page&limit
  POST   /v1/admin/products          { name, category, variants[…], images[…] }
  PATCH  /v1/admin/products/:id
  DELETE /v1/admin/products/:id

Banners (admin)  GET/POST/PATCH/DELETE  /v1/admin/banners

Public (no auth — for customer apps)
  GET  /v1/public/fulfillment
  GET  /v1/public/categories
  GET  /v1/public/categories/tree
  GET  /v1/public/categories/:slug
  GET  /v1/public/brands
  GET  /v1/public/products?q&category=slug&brand=slug&minPrice&maxPrice&sort&page&limit
  GET  /v1/public/products/:slug
  GET  /v1/public/banners?position=home_hero
  GET  /v1/public/home                  ← aggregated feed for customer home
```

### Seed sample grocery data

```bash
npm run seed:catalog     # 9 categories + 5 subs + 12 brands + 15 products + 2 banners
node src/scripts/smokeTest.js   # full end-to-end verification
```

### Product model — grocery specific

Each product has an array of `variants`, one per pack size:

```js
variants: [
  { unit: 'kg', value: 5, mrp: 410, sellingPrice: 315, stock: 100,
    minOrderQty: 1, maxOrderQty: 5, stepQty: 1, isDefault: true, sku: 'AASH-ATTA-5KG' },
  { unit: 'kg', value: 10, mrp: 780, sellingPrice: 615, stock: 100,
    minOrderQty: 1, maxOrderQty: 3, sku: 'AASH-ATTA-10KG' },
]
```

`productService.enforceQtyRules(variant, qty)` will be reused by cart in P3.

### Image uploads

`POST /v1/admin/upload` accepts multipart `file` and forwards to Cloudinary.
Returns `{ url, publicId }`. Use the `publicId` when deleting later.
For product image transforms in the frontend, append Cloudinary URL params:

```
https://res.cloudinary.com/xmldtlpy/image/upload/w_400,h_400,c_fill,q_auto,f_auto/v1/savera-kirana/products/xyz.jpg
```

## Roadmap — what comes next

| Phase | Modules | Notes |
|---|---|---|
| **✅ P1 Foundation** | auth + admins + settings | Done |
| **✅ P2 Catalog** | categories, brands, products+variants, banners, uploads, search, filters | Done |
| **P3 Cart & Checkout** | addresses, cart (with minOrderQty enforcement), coupons, delivery slots, orders, Razorpay + COD | fulfillment mode branches here |
| **P4 Ops** | inventory in/out, low-stock alerts, order status flow, rider CRUD + assign, GST invoice PDF | |
| **P5 Admin UI** | full Vite/React panel across 3 dashboards | Stitch designs live in `SAVERA-UI-DOC` |
| **P6 Customer Web** | Next.js Flipkart-grocery style storefront | tokens already wired |
| **P7 Polish** | notifications (push/SMS/WhatsApp), reports, SEO, PM2 config, deploy | |
