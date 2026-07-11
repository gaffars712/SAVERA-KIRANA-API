# 🔑 What YOU need to provide

This guide lists **exactly** what keys/accounts I need from you to make each feature real.
Everything works in "dev mode" today — you only need to add these when you're ready to go live.

---

## 1. OTP delivery — Firebase Phone Auth (FREE 10,000/month)

**What you need:** A Firebase project + 7 env values (5 in client, 1 in server, 1 for the service account).

### Steps

1. Go to **https://console.firebase.google.com** → click "Add project" → name it `savera-kirana`.
2. Once created, in the left sidebar: **Build → Authentication → Get started**.
3. Under **Sign-in method**, click **Phone** → toggle it **ON** → Save.
4. **(Testing only)** Under Sign-in method → Phone → scroll to "Phone numbers for testing" → add:
   - `+91 98765 43210` with OTP `123456`  (any 10-digit number + any 6-digit OTP)
   - Add your own phone here too so you can test without burning free quota.
5. Get the **web app config** for the customer web:
   - Click ⚙ gear icon → **Project settings**
   - Under **Your apps**, click **Web (</> icon)** → Register app name "savera-kirana-web"
   - Copy the 5 values from the shown config object.

6. Get the **service account** for the backend:
   - Same Project settings page → tab **Service accounts** → **Generate new private key** → downloads a JSON file.
   - Base64-encode that JSON. On Windows PowerShell:
     ```powershell
     [Convert]::ToBase64String([IO.File]::ReadAllBytes("savera-kirana-firebase-adminsdk.json"))
     ```

### Where to put the values

**`SAVERA-KIRANA-API/.env`** (server):
```env
FIREBASE_SERVICE_ACCOUNT_B64=<the base64 string from step 6>
```

**`SAVERA-KIRANA/.env.local`** (customer web):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=savera-kirana.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=savera-kirana
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abc...
```

Restart both servers. Login screen will now say "🔒 Secured by Firebase" and send real SMS.

### What if I don't want to set this up yet?

**No problem — the app runs today without Firebase.** Just log in with any 10-digit phone → the OTP is **shown as a toast in the browser** and also **printed to the API server console**. That's dev mode. When you're ready to go live, follow the steps above.

---

## 2. Payments — Razorpay (Google Pay works inside Razorpay via UPI)

Google Pay in India uses UPI. Razorpay Standard Checkout supports UPI natively, so **selecting "UPI · Google Pay" on our checkout opens Razorpay's sheet where Google Pay is a payment option** — no separate Google Pay integration needed.

### Steps

1. Go to **https://dashboard.razorpay.com** → sign up (free, KYC takes 2-3 days for live keys).
2. **Settings → API Keys** → Generate Test Keys (you can integrate + test immediately with test cards).
3. Copy both:
   - `Key ID` (starts with `rzp_test_...` for test mode, `rzp_live_...` for live)
   - `Key Secret`

### Where to put them

**`SAVERA-KIRANA-API/.env`** (server):
```env
RAZORPAY_KEY_ID=rzp_test_abc123
RAZORPAY_KEY_SECRET=your_secret_here
```

**`SAVERA-KIRANA/.env.local`** (customer web):
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_abc123
```

Restart both servers. Non-COD payments will now open Razorpay's checkout with UPI/Google Pay/cards/netbanking.

### Testing with test keys

Razorpay provides test cards:
- Success: `4111 1111 1111 1111` · any CVV · any future expiry
- Failure: `4000 0000 0000 0002`
- Test UPI: `success@razorpay` (auto-succeeds)

### What if I don't want to set this up yet?

**COD works today without Razorpay.** For non-COD, the app detects missing keys and shows a "dev mode" toast — the order is created and marked paid so you can test the full flow.

---

## 3. Cloudinary (already done ✅)

Already configured. Your keys are in `.env`:
```
CLOUDINARY_CLOUD_NAME=xmldtlpy
CLOUDINARY_API_KEY=178132678999111
CLOUDINARY_API_SECRET=m6og44f_3gafTsZCMoJGxQlJgQ8
```

Image uploads in Product Form + Banners + Brands admin pages upload directly to your Cloudinary account.

---

## 4. Where to see your account / orders (for customers)

After login on the customer web:

- **Bottom mobile tab bar → "Account"** — that's your profile. Shows:
  - Your name, phone, wallet balance
  - **Big "🟢 Order in progress"** card if you have an active order
  - Quick stats: total orders, wishlist count, delivered count
  - Menu: Order history, Saved addresses, Wishlist, Coupons, Support
- **Bottom mobile tab bar → "Orders"** — full order history (All / Ongoing / Delivered / Cancelled tabs)
- **Desktop header → "Orders" link** — same order history page
- **Tap any order** → tracking page with real-time status (30s auto-refresh), pickup code (if pickup), rider info (if out for delivery), items, address, payment

---

## Feature status summary

| Feature | Works today? | Needs from you |
|---|---|---|
| Browse catalog, add to cart | ✅ Yes | Nothing |
| Wishlist, addresses, coupons | ✅ Yes | Nothing |
| Login (dev-OTP shown as toast) | ✅ Yes | Nothing |
| Login (real SMS) | ⚙ After setup | Firebase project (§1) |
| Checkout with COD | ✅ Yes | Nothing |
| Checkout with UPI / Google Pay / Cards | ⚙ After setup | Razorpay keys (§2) |
| Admin: add products with images | ✅ Yes | Nothing |
| Admin: manage brands, categories, banners, coupons, riders | ✅ Yes | Nothing |
| Admin: real-time dashboard, orders, pickup queue | ✅ Yes | Nothing |

That's it — everything else is already wired.
