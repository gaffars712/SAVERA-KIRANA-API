const mongoose = require('mongoose');
const counterIncrementor = require('../../utils/counterIncrementer');
const { toJSON, paginate } = require('../../models/plugins');

const inventorySchema = new mongoose.Schema({
    unit: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    _id: false
});

const priceSchema = new mongoose.Schema({
    sellingCost: {
        type: Number,
        required: true,
    },
    originalCost: {
        type: Number,
        required: true,
    },
    unit: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
}, {
    _id: false
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    bannerImage: {
        type: String,
        default: 'https://mayaproject.s3.ap-south-1.amazonaws.com/uploads/1719829318420/No-Image-Placeholder.svg.png',
        required: true,
    },
    subImages: {
        type: [String],
        default: [],
    },
    type: {
        type: [String],
        default: [],
    },
    category: {
        type: String,
        required: true,
    },
    variety: {
        type: String,
        required: true,
    },
    inventory: {
        type: inventorySchema,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: priceSchema,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    serviceProviderId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    seqId: {
        type: Number,
        unique: true,
    }
}, {
    timestamps: true,
});

/**
 * @typedef Product
 */
productSchema.plugin(toJSON);
productSchema.plugin(paginate);

productSchema.pre('save', async function (next) {
    const doc = this;
    if (!doc.seqId) {
        doc.seqId = await counterIncrementor('product');
    }
    next();
});

/**
 * @typedef Product
 */
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
