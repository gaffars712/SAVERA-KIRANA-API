# 🚀 Savera Kirana — Launch Guide

You now have a **live end-to-end grocery e-commerce platform**. This guide walks
you from empty machine to a live URL customers can use.

## What you're deploying

| Layer | Repo | Deploy target | Free tier |
|---|---|---|---|
| API | SAVERA-KIRANA-API | **Render** | Free web service (spins down after 15 min idle) |
| Customer web | SAVERA-KIRANA | **Vercel** | Hobby plan |
| Admin panel | SAVERA-KIRANA-ADMIN | **Vercel** | Hobby plan |
| Database | (already live) | **MongoDB Atlas** M0 | 512 MB free |
| Images | (already live) | **Cloudinary** | 25 GB storage + 25 GB egress/month |
| OTP | Firebase Phone Auth | Google Cloud | 10,000 verifications/month free |
| Payments | Razorpay | pay-per-transaction only, no fixed fee |

Total cost to launch: **₹0/month** until you hit ~500 daily active users.

---

## Local development (verify everything runs)

Open 3 terminals:

```bash
# ─────────── Terminal 1 — API ───────────
cd C:\Users\Lenovo\Desktop\SAVERA-KIRANA-API
npm install
npm run seed:super-admin   # first time only
npm run seed:catalog       # first time only — creates products/banners
npm run dev                # http://localhost:4000

# ─────────── Terminal 2 — Customer web ───────────
cd C:\Users\Lenovo\Desktop\SAVERA-KIRANA
npm install
npm run dev                # http://localhost:3000

# ─────────── Terminal 3 — Admin panel ───────────
cd C:\Users\Lenovo\Desktop\SAVERA-KIRANA-ADMIN
npm install
npm run dev                # http://localhost:5173
```

Then:
1. Open `http://localhost:3000` → tap "Login" → enter any 10-digit number
2. Server console prints the OTP (also shown as toast in the browser) — enter it
3. Add items → cart → checkout → **place a pickup order → COD**
4. Open `http://localhost:5173` in another tab → login as `gaffar@sdlccorp.com` / `ChangeMe@123`
5. Go to **Pickup Queue** → see the new order → click **Mark Ready**
6. Switch back to customer tab → refresh order tracking → status = "Ready" with the code
7. Back on admin → **Verify & hand over** → enter the code → status flips to "Picked up"

That's the full loop working end-to-end against your Atlas cluster.

---

## Production deploy

### 1) Deploy the API to Render

**a. Push to GitHub:**
```bash
cd C:\Users\Lenovo\Desktop\SAVERA-KIRANA-API
git init && git add . && git commit -m "chore: initial deploy"
gh repo create savera-kirana-api --private --source . --push
```

**b. On Render:**
1. New → **Blueprint** → connect the `savera-kirana-api` repo
2. Render detects `render.yaml` and creates the service
3. Fill in every env var marked `sync: false`:
   - `MONGODB_URL` — your Atlas connection string
   - `JWT_SECRET` — long random string (`openssl rand -hex 32`)
   - `SUPER_ADMIN_*` — creds for the first admin
   - `CLOUDINARY_*` — from cloudinary.com dashboard
   - `FIREBASE_SERVICE_ACCOUNT_B64` — see step 3 below
   - `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` — from razorpay.com
   - `CORS_ORIGINS` — your Vercel URLs (comma-separated)
4. Deploy. Once live, note the URL, e.g. `https://savera-kirana-api.onrender.com`
5. Open Render shell → run `npm run seed:super-admin` and `npm run seed:catalog`

### 2) Set up Firebase Phone Auth

1. https://console.firebase.google.com → **Add project** → "savera-kirana"
2. **Authentication** → Sign-in method → enable **Phone**
3. Add your **test phone numbers** (they bypass real SMS during dev)
4. **Project Settings** → **Service accounts** → **Generate new private key** → downloads a JSON file
5. Base64-encode it and paste into `FIREBASE_SERVICE_ACCOUNT_B64` env var on Render:
   ```powershell
   # PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("savera-kirana-firebase.json"))
   ```
6. Also copy the Firebase **web app** config keys — you'll need them for the customer web
   (Project settings → General → Your apps → Web app → Config)

### 3) Deploy the customer web to Vercel

**a. Push to GitHub:**
```bash
cd C:\Users\Lenovo\Desktop\SAVERA-KIRANA
git init && git add . && git commit -m "chore: initial deploy"
gh repo create savera-kirana-web --private --source . --push
```

**b. On Vercel:**
1. New Project → import the `savera-kirana-web` repo
2. Framework: **Next.js** (auto-detected)
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = `https://savera-kirana-api.onrender.com/v1`
   - `NEXT_PUBLIC_FIREBASE_API_KEY` = your Firebase web key
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `savera-kirana.firebaseapp.com`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `savera-kirana`
   - `NEXT_PUBLIC_FIREBASE_APP_ID` = your app ID
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID` = your Razorpay key ID (public)
4. Deploy. Note the URL, add it to your API's `CORS_ORIGINS` env var.

### 4) Deploy the admin panel to Vercel

Same flow, framework: **Vite**, env var `VITE_API_URL`.

### 5) Firebase Phone Auth wiring (next release)

The customer web currently uses the **console-OTP flow** (`/auth/otp/*`). To swap
to Firebase in production:

1. `npm install firebase` inside `SAVERA-KIRANA`
2. Create `src/lib/firebase.js`:
```js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
export const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
export const auth = getAuth(app);
```
3. In `login/page.jsx`, replace the OTP request/verify calls with:
```js
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";
// … signInWithPhoneNumber(auth, fullPhone, new RecaptchaVerifier(auth, "recaptcha-container"))
// on OTP submit: confirmationResult.confirm(otp).then(cred => cred.user.getIdToken()).then(idToken => api.post("/auth/firebase/phone", { idToken }))
```
4. Server-side endpoint is already live: `POST /v1/auth/firebase/phone { idToken, name? }` returns our JWT.

### 6) Razorpay checkout (next release)

Backend `/orders/verify-payment` is already live. On the checkout success screen
add:
```js
const razorpay = new Razorpay({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  order_id: placed.razorpay.id,
  amount: placed.razorpay.amount,
  handler: async (r) => {
    await orderApi.verifyPayment({
      orderId: placed.order.id,
      razorpayOrderId: placed.razorpay.id,
      razorpayPaymentId: r.razorpay_payment_id,
      razorpaySignature: r.razorpay_signature,
    });
  },
});
razorpay.open();
```

---

## What's live today (COD end-to-end)

- Customer signs up via phone OTP
- Browses catalog from Atlas via Cloudinary CDN
- Adds items to cart with server-enforced min/max/step qty
- Applies coupons (validated server-side)
- Checks out with fulfillment toggle honoring Super Admin's settings
- Places **delivery** or **pickup** order — COD works fully
- Admin sees new order in Pickup Queue / Orders list
- Store Manager marks ready → SMS/toast sent
- Handover verified by 4-digit code
- Customer sees status update live in their orders page

---

## Cost math when you scale

| Users/month | API (Render) | Cloudinary | Firebase | Razorpay | MongoDB | Total |
|---|---|---|---|---|---|---|
| 100 | Free | Free | Free | ~₹200 fees | Free | ~₹200 |
| 1,000 | Free | Free | Free | ~₹2,000 fees | Free | ~₹2,000 |
| 10,000 | ₹590 (Starter) | Free | Free | ~₹20,000 fees | Free (still M0) | ~₹20,600 |
| 100,000 | ₹1,900 (Standard) | ₹4,000 | Free (limit hit) | ~₹200,000 fees | ₹1,900 (M10) | ~₹7,900 fixed + ₹200,000 transaction |

Payment fees are pass-through; margins on grocery are 15-25% so ₹200/order in
gateway fees on a ₹1,000 basket is 2% — well within grocery margins.
