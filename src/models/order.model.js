const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    variantId: mongoose.Schema.Types.ObjectId,
    name: String,
    label: String,
    image: String,
    qty: Number,
    mrp: Number,
    sellingPrice: Number,
    gstSlab: Number,
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: String,
    at: { type: Date, default: () => new Date() },
    note: String,
    by: { type: String }, // 'system' | admin id
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },

    // What
    items: [orderItemSchema],
    itemCount: Number,

    // How it's fulfilled — the toggle
    fulfillmentType: { type: String, enum: ['delivery', 'pickup'], required: true, index: true },
    address: mongoose.Schema.Types.Mixed, // snapshot; null for pickup
    slot: String,
    zone: { type: mongoose.Schema.Types.ObjectId, ref: 'deliveryZones' },

    // Pricing snapshot
    subtotal: Number,
    itemDiscount: Number,
    coupon: {
      code: String,
      discount: Number,
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'coupons' },
    },
    deliveryFee: Number,
    handling: Number,
    packaging: Number,
    total: Number,

    // Payment
    payment: {
      method: { type: String, enum: ['razorpay', 'upi', 'card', 'netbanking', 'wallet', 'cod'], required: true },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      paidAt: Date,
      failureReason: String,
    },

    // Delivery-specific
    rider: { type: mongoose.Schema.Types.ObjectId, ref: 'riders' },
    riderSnapshot: mongoose.Schema.Types.Mixed,
    assignedAt: Date,

    // Pickup-specific
    pickup: {
      code: String, // 4-digit
      readyAt: Date,
      pickedUpAt: Date,
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'admins' },
      cashCollected: Number,
    },

    // State machine
    status: {
      type: String,
      enum: [
        'placed',
        'packed', 'out_for_delivery', 'delivered',
        'preparing', 'ready', 'picked_up',
        'cancelled', 'refunded',
      ],
      default: 'placed',
      index: true,
    },
    cancelReason: String,
    notes: String,

    timeline: [timelineSchema],
  },
  { timestamps: true }
);

orderSchema.plugin(toJSON);
orderSchema.index({ createdAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('orders', orderSchema);
module.exports = Order;
