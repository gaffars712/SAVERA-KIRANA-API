const config = require('../config/config');
const logger = require('../config/logger');

let twilioClient = null;
if (config.twilio.accountSid && config.twilio.authToken) {
  try {
    // eslint-disable-next-line global-require
    twilioClient = require('twilio')(config.twilio.accountSid, config.twilio.authToken);
  } catch (e) {
    logger.warn('Twilio init failed: ' + e.message);
  }
}

const sendSms = async (to, body) => {
  if (!twilioClient) {
    logger.info(`[SMS-DEV] to=${to} :: ${body}`);
    return { dev: true };
  }
  const opts = { to, body };
  if (config.twilio.messagingServiceSid) opts.messagingServiceSid = config.twilio.messagingServiceSid;
  else if (config.twilio.from) opts.from = config.twilio.from;
  return twilioClient.messages.create(opts);
};

const sendOtp = async (phone, code) => {
  const body = `Your Savera Kirana OTP is ${code}. Valid for 5 minutes. Do not share.`;
  return sendSms(phone, body);
};

const sendPickupReady = async (phone, orderCode, pickupCode) => {
  const body = `Your Savera Kirana order ${orderCode} is ready for pickup. Show code ${pickupCode} at the counter.`;
  return sendSms(phone, body);
};

module.exports = { sendSms, sendOtp, sendPickupReady };
