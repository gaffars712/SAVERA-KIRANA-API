const config = require('../config/config');
const logger = require('../config/logger');
const msg91 = require('./msg91.service');

let twilioClient = null;
if (config.twilio.accountSid && config.twilio.authToken) {
  try {
    // eslint-disable-next-line global-require
    twilioClient = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
  } catch (e) {
    logger.warn('Twilio init failed: ' + e.message);
  }
}

/**
 * Generic SMS sender — falls back to console log in dev if no provider configured.
 * Twilio has better global reach; MSG91 is cheaper for India-only.
 */
const sendSms = async (to, body) => {
  if (twilioClient) {
    const opts = { to, body };
    if (config.twilio.messagingServiceSid) opts.messagingServiceSid = config.twilio.messagingServiceSid;
    else if (config.twilio.from) opts.from = config.twilio.from;
    return twilioClient.messages.create(opts);
  }
  logger.info(`[SMS-DEV] to=${to} :: ${body}`);
  return { dev: true };
};

/**
 * OTP-specific sender: prefers MSG91 (Indian OTP provider, cheapest for India)
 * because it uses their DLT-approved template with our OTP as a variable.
 * Falls back to Twilio, then to console log.
 */
const sendOtp = async (phone, code) => {
  if (msg91.isConfigured()) {
    const r = await msg91.sendOtp(phone, code);
    if (r.ok) return { provider: 'msg91', requestId: r.requestId };
    logger.warn('MSG91 failed, falling back: ' + r.error);
  }
  const body = `Your Savera Kirana OTP is ${code}. Valid for 5 minutes. Do not share.`;
  return sendSms(phone, body);
};

const sendPickupReady = async (phone, orderCode, pickupCode) => {
  const body = `Your Savera Kirana order ${orderCode} is ready for pickup. Show code ${pickupCode} at the counter.`;
  return sendSms(phone, body);
};

module.exports = { sendSms, sendOtp, sendPickupReady };
