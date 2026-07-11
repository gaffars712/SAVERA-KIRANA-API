/**
 * MSG91 SMS integration (India-focused OTP provider).
 * https://docs.msg91.com/otp/send-otp
 *
 * Env vars needed:
 *   MSG91_AUTH_KEY       (from MSG91 dashboard → Auth Key)
 *   MSG91_TEMPLATE_ID    (DLT-approved OTP template ID)
 *   MSG91_SENDER_ID      (6-char sender ID, default: "SAVKIR")
 *
 * We generate the OTP ourselves (bcrypt-hashed with TTL in DB), and use
 * MSG91's Send OTP API only as the SMS delivery channel. This keeps us
 * fully in control of OTP verification — MSG91 is only sending SMS.
 */

const axios = require('axios');
const config = require('../config/config');
const logger = require('../config/logger');

const BASE = 'https://control.msg91.com/api/v5';

const isConfigured = () =>
  !!(config.msg91.authKey && config.msg91.templateId);

/**
 * Send an OTP via MSG91.
 *
 * @param {string} phone   phone number in +91XXXXXXXXXX format (with or without +)
 * @param {string} otp     6-digit OTP code we generated
 * @returns {Promise<{ok: boolean, requestId?: string, error?: string}>}
 */
const sendOtp = async (phone, otp) => {
  if (!isConfigured()) return { ok: false, error: 'MSG91 not configured' };

  // MSG91 expects mobile in "919876543210" format — no + prefix, country code first
  const mobile = phone.replace(/^\+/, '');

  try {
    const res = await axios.post(
      `${BASE}/otp`,
      null,
      {
        params: {
          template_id: config.msg91.templateId,
          mobile,
          otp,
          authkey: config.msg91.authKey,
          otp_expiry: 5,       // minutes — matches our own TTL
          otp_length: 6,
        },
        timeout: 10_000,
      }
    );
    if (res.data?.type === 'success') {
      return { ok: true, requestId: res.data.request_id };
    }
    return { ok: false, error: res.data?.message || 'MSG91 error' };
  } catch (e) {
    const msg = e.response?.data?.message || e.message;
    logger.warn('MSG91 sendOtp failed: ' + msg);
    return { ok: false, error: msg };
  }
};

module.exports = { sendOtp, isConfigured };
