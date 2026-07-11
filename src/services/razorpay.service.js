const crypto = require('crypto');
const config = require('../config/config');
const logger = require('../config/logger');

let client = null;
if (config.razorpay.keyId && config.razorpay.keySecret) {
  try {
    // eslint-disable-next-line global-require
    const Razorpay = require('razorpay');
    client = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  } catch (e) {
    logger.warn('Razorpay init failed: ' + e.message);
  }
}

const isConfigured = () => !!client;

/**
 * In dev/no-Razorpay mode, returns a mock order so the flow still works.
 */
const createOrder = async ({ amountInr, receipt, notes }) => {
  if (!client) {
    return {
      id: 'order_dev_' + Date.now(),
      amount: Math.round(amountInr * 100),
      currency: 'INR',
      status: 'created',
      receipt,
      dev: true,
    };
  }
  return client.orders.create({
    amount: Math.round(amountInr * 100),
    currency: 'INR',
    receipt: receipt || `sk_${Date.now()}`,
    notes,
    payment_capture: 1,
  });
};

/**
 * Verify signature: hmac(order_id + '|' + payment_id, secret) === signature
 */
const verifySignature = ({ orderId, paymentId, signature }) => {
  if (!config.razorpay.keySecret) return true; // dev bypass
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
};

const verifyWebhookSignature = (rawBody, signature) => {
  if (!config.razorpay.webhookSecret) return true;
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
};

module.exports = { createOrder, verifySignature, verifyWebhookSignature, isConfigured };
