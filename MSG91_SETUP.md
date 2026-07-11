# 📱 MSG91 Setup Guide (India OTP delivery)

MSG91 is an Indian SMS provider — cheaper than Twilio, no billing setup like Firebase Blaze,
DLT-compliant by default. Pay only for SMS you send.

**Cost:** ₹150 for 1000 OTP SMS (~₹0.15 per OTP). No monthly fee.

---

## Step 1: Create MSG91 account (free)

1. Go to **https://msg91.com** → click **"Sign Up"** (top right)
2. Enter your name, email, phone → verify email
3. You'll land on the MSG91 dashboard: **https://control.msg91.com**

## Step 2: Get your Auth Key

1. In the left sidebar, click **"Auth Key"** (or scroll to find it)
   Direct link: **https://control.msg91.com/app/user/authkey**
2. Copy the **Auth Key** shown on that page — a long alphanumeric string like:
   ```
   4XXXXX9AbCdEfGhIjKl0123
   ```
   
## Step 3: Choose or create a template

MSG91 requires SMS templates to be pre-registered under India's DLT (Distributed Ledger Technology) framework — TRAI's anti-spam rule.

### Option A: Use MSG91's default OTP template (easiest, works immediately)

1. In left sidebar → **SMS → Templates** (or search "template")
2. Click **"Explore Templates"** tab
3. Find a pre-approved OTP template with `##OTP##` variable, e.g.:
   ```
   Template: "##OTP## is your OTP for verification. Do not share this with anyone."
   ```
4. Click **"Get Template ID"** → copy the ID (e.g. `6AbCdEf01234567`)

### Option B: Create your own DLT template (better long-term, takes 1-2 days to approve)

1. First register on TRAI DLT portal (**https://www.trai.gov.in** → DLT)
2. Register as an "Entity" → get PE ID
3. Register your sender ID (e.g. `SAVKIR`)
4. Register a template like:
   ```
   {#var#} is your OTP for Savera Kirana. Valid for 5 minutes. Do not share.
   ```
5. Once approved by your telecom operator, MSG91 auto-syncs it → you'll see the ID in Templates section

**For now, use Option A** — start with MSG91's approved template so you can test today.

## Step 4: Add credits

1. Left sidebar → **Wallet** (or **Recharge**)
2. Recharge with ₹150-500 (via UPI/Card) — starts at ₹150 for ~1000 OTPs
3. **You don't need to add a card on file** — pay-as-you-go, no auto-debit

## Step 5: Paste keys into `.env`

Open **`SAVERA-KIRANA-API/.env`**:

```env
MSG91_AUTH_KEY=paste_your_auth_key_here
MSG91_TEMPLATE_ID=paste_template_id_here
MSG91_SENDER_ID=SAVKIR
```

**Note about SENDER_ID:** During DLT registration you get an approved sender ID.
For testing with MSG91's default template, `SAVKIR` won't be used — MSG91 uses the template's own sender.

## Step 6: Restart the API server

```bash
cd C:\Users\Lenovo\Desktop\SAVERA-KIRANA-API
npm run dev
```

Server console should NOT print `[SMS-DEV]` messages anymore when OTP is requested — real SMS goes out.

## Step 7: Test

1. Open customer web → `/login`
2. Enter your phone number
3. Real SMS arrives in 5-15 seconds
4. Enter OTP → logged in

---

## 🐛 Troubleshooting

### "Template not approved" error
- You're using an unapproved DLT template. Use **Option A** (Explore Templates → pre-approved OTP template).

### "Insufficient balance"
- Recharge your MSG91 wallet (Step 4).

### "Invalid mobile number"
- MSG91 needs country code without `+` (e.g., `919876543210`). Our code strips the `+` automatically.

### SMS not arriving after "success" response
- Test with your own registered mobile first
- Check MSG91 dashboard → **Reports → SMS Logs** to see delivery status
- Indian telecoms sometimes delay/drop OTP SMS — try Airtel/Jio for testing

### Fall back to dev mode temporarily
- Leave `MSG91_AUTH_KEY` empty in `.env` → OTPs print to server console (no SMS sent)
- Useful while waiting for DLT template approval

---

## 💰 Cost comparison

| Provider | Cost per OTP | Setup requirement | India-optimized |
|---|---|---|---|
| **MSG91** ✅ | **₹0.15** | Just sign up + recharge | Yes |
| Firebase Phone Auth | ₹0 (up to 10K/mo) | Requires Blaze billing + card | Global |
| Twilio | ~₹5 | Card required | Global |
| Fast2SMS | ₹0.30 | No monthly fee | Yes |

**Recommendation:** MSG91 is the sweet spot for India-only launches.
