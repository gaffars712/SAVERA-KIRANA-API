const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON, paginate } = require('../../../../models/plugins');
const counterIncrementor = require('../../../../utils/counterIncrementer');

const commoditySchema = mongoose.Schema({
    commodityType: {
        type: String,
        required: true
    },
    variety: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ['kg', 'liters', 'units', 'quintal', 'metricTonne(MT)'],
        required: true
    }
}, {
    _id: false
});
const priceShema = mongoose.Schema({
    price: {
        type: Number,
        require: true
    },
    unit: {
        type: String,
        enum: ['kg', 'liters', 'units', 'quintal', 'metricTonne(MT)'],
        require: true,
    }
}, {
    _id: false
})
const priceInformationSchema = mongoose.Schema({
    reservePrice: {
        type: priceShema,
        required: true
    },
    initialPrice: {
        type: priceShema,
        required: true
    },

}, {
    _id: false
});

const auctionInfoSchema = mongoose.Schema(
    {
        procurementType: {
            type: String,
            enum: ['farm-gate', 'warehouse'],
            required: true
        },
        status: {
            type: String,
            enum: ['live', 'draft'],
        },
        auctionType: {
            type: String,
            enum: ['buy', 'sell'],
            required: true
        },
        commodity: {
            type: commoditySchema,
            required: true
        },
        commodityImages: {
            type: [String],
            required: false
        },
        qualityCertificate: {
            type: String,
        },
        priceInformation: {
            type: priceInformationSchema,
            required: true
        },
        productSpecification: {
            type: String,
            required: true
        },
        active: {
            type: Boolean,
            default: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        status: {
            type: String,
            enum: ['draft', 'in-review', 'live', 'expired'],
            default: "draft"
        },
        serviceProviderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        seqId: {
            type: Number
        },

    },
    {
        timestamps: true,
    }
);
auctionInfoSchema.plugin(toJSON);
auctionInfoSchema.plugin(paginate);

auctionInfoSchema.pre("save", async function (next) {
    const doc = this;
    doc.seqId = await counterIncrementor("auction-details-information");
    next();
});

/**
 * @typedef AuctionGeneralInfo
 */

const AuctionGeneralInfo = mongoose.model('auction-details-information', auctionInfoSchema);

module.exports = AuctionGeneralInfo;
