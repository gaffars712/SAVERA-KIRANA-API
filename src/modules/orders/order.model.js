const mongoose = require('mongoose');
const counterIncrementor = require('../../utils/counterIncrementer');
const { toJSON, paginate } = require('../../models/plugins');

const orderShema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    cartId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true
    },
    cartTotalAmount: {
        type: Number,
        required: true
    },
    deliveryCharge: {
        type: Number,
        default: 0
    },
    deliveryExpectedDate: {
        type: Date,
        default: () => {
            let date = new Date();
            date.setDate(date.getDate() + 2);
            return date;
        }
    },
    packagingCharge: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    address: {
        street: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        state: {
            type: String,
            default: ''
        },
        zip: {
            type: String,
            default: ''
        },
        country: {
            type: String,
            default: 'india'
        }
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled', 'active'],
        default: "active"
    },
    totalAmount: {
        type: Number,
        required: true,
    }
}, {
    timestamps: true,
});

/**
 * @typedef Order
 */
orderShema.plugin(toJSON);
orderShema.plugin(paginate);

/**
 * @typedef Order
 */
const Order = mongoose.model('Order', orderShema);

module.exports = Order;