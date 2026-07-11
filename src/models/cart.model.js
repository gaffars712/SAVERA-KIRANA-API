const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true }, // subdoc id in product.variants
    qty: { type: Number, required: true, min: 1 },

    // Snapshotted at add-time so cart survives price/name changes
    name: String,
    label: String,
    image: String,
    mrp: Number,
    sellingPrice: Number,
    minOrderQty: Number,
    maxOrderQty: Number,
    stepQty: Number,
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
    couponCode: { type: String, default: '' },
    couponDiscount: { type: Number, default: 0 },
    couponMeta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

cartSchema.plugin(toJSON);

const Cart = mongoose.model('carts', cartSchema);
module.exports = Cart;
