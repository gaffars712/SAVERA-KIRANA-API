const mongoose = require('mongoose');
const counterIncrementor = require('../../utils/counterIncrementer');
const { toJSON, paginate } = require('../../models/plugins');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    price: {
        type: Number,
    },
    discount: {
        type: Number,
        default: 0,
    }
}, {
    _id: false
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    items: {
        type: [cartItemSchema],
        default: [],
    },
    status: {
        type: String,
        enum: ['active', 'purchased', 'abandoned'],
        default: 'active',
    },
    totalQuantity: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    seqId: {
        type: Number,
        unique: true,
    }
}, {
    timestamps: true,
});

/**
 * @typedef Cart
 */
cartSchema.plugin(toJSON);
cartSchema.plugin(paginate);

cartSchema.pre('save', async function (next) {
    const doc = this;
    doc.seqId = await counterIncrementor('cart');
    next();
});

/**
 * @typedef Cart
 */
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
