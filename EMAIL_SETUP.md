# 📧 Gmail SMTP Setup — FREE Email OTP + Order Confirmations

**Cost:** ₹0 forever. Gmail allows 500 emails/day per account — way more than a
new grocery store needs.

**What you need:** A Gmail account + 5 minutes.

---

## Step 1: Enable 2-Step Verification on your Google account

Gmail requires 2-Step Verification (2FA) to be enabled before you can create App Passwords.

1. Go to **https://myaccount.google.com/security**
2. Under **"How you sign in to Google"**, find **2-Step Verification**
3. If it says **"On"** → skip to Step 2
4. If it says **"Off"** → click it → follow the setup (add your phone, verify)

## Step 2: Generate an App Password

App Passwords are 16-character passwords that let apps use your Gmail without your real password.

1. Go to **https://myaccount.google.com/apppasswords**
2. Under **"App name"**, type: `Savera Kirana`
3. Click **Create**
4. Google shows a **16-character password** like:
   ```
   abcd efgh ijkl mnop
   ```
   Remove the spaces → `abcdefghijklmnop`
5. **Copy it now** — you can't see it again after closing.

> **Can't find App Passwords page?**  
> - Make sure 2-Step Verification is ON (Step 1)  
> - Try the direct URL: https://myaccount.google.com/apppasswords  
> - If Google says "not available", enable 2FA first (Step 1)

## Step 3: Paste into `.env`

Open **`SAVERA-KIRANA-API/.env`** and set:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=Savera Kirana <your-email@gmail.com>
```

- `SMTP_USER` — your Gmail address
- `SMTP_PASS` — the 16-char App Password from Step 2 (NOT your Gmail login password)
- `SMTP_FROM` — display name customers see when they get emails

## Step 4: Restart the API server

```bash
cd C:\Users\Lenovo\Desktop\SAVERA-KIRANA-API
npm run dev
```

## Step 5: Test

1. Open **http://localhost:3000/login**
2. Enter your email → click **Continue**
3. Check your inbox — a beautifully styled OTP email arrives in ~5 seconds
4. Enter the 6-digit code → logged in ✓

---

## 🎬 What the user experience looks like

**Login flow:**
```
Email → OTP → Verified → In
```

**No mobile number asked at login.** The phone is only captured **once, at
first checkout**, when the delivery partner actually needs to call the
customer. It's saved in the user profile and never asked again.

**Emails customers receive:**
- **Login OTP** — clean branded template with the 6-digit code
- **Order confirmation** — order code, total, pickup code (if pickup)
- (Future) Order status updates: packed, out for delivery, delivered

---

## 🐛 Troubleshooting

### "Invalid login" error
- You're using your Gmail login password instead of an App Password. App Password is 16 chars, generated at https://myaccount.google.com/apppasswords

### "Less secure app access" blocked
- This is the old Gmail policy — Google removed it in 2022. You MUST use App Passwords now.

### Emails going to spam
- First few emails from a new sender often land in Spam. Ask users to check spam + mark as "Not spam" once. After a few users do this, deliverability improves.

### Want to send from a custom domain (e.g., no-reply@saverakirana.in)?
- Set up **Google Workspace** (₹136/user/month) — same Gmail SMTP but with your domain
- Or use **Resend** (free 3000/month with custom domain, no card): https://resend.com
- Or **Brevo** (formerly Sendinblue) — 300/day free tier

### Rate limits
- **500 emails/day per Gmail account** — resets midnight PT (12:30 PM IST)
- For higher volume, upgrade to Workspace or use Resend

### Testing without setup (dev mode)
- Leave `SMTP_USER` and `SMTP_PASS` blank → OTPs print to server console + shown as big card in login page
- 100% functional for development and testing

---

## 💰 Total launch cost recap

| Service | Cost | Why |
|---|---|---|
| **Gmail SMTP** | ₹0 | Free forever, 500/day |
| **MongoDB Atlas** | ₹0 | Free M0 cluster |
| **Cloudinary** | ₹0 | 25 GB/mo free |
| **Razorpay** | 2% per transaction | Only when you actually receive money |
| **Render (API)** | ₹0 | Free web service |
| **Vercel (frontends)** | ₹0 | Hobby plan |

**Real total: ₹0/month + 2% cut of revenue when customers actually pay.**

That's the setup. Paste the SMTP_USER + SMTP_PASS in `.env` and you're done.
