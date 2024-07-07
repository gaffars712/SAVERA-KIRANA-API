const mongoose = require('mongoose');
const counterIncrementor = require('../../../utils/counterIncrementer');
const { toJSON, paginate } = require('../../../models/plugins');

const fieldSchema = new mongoose.Schema({
    active: {
        type: Boolean,
        default: true,
    },
    serviceProviderRole: {
        type: String,
        enum: ['farmer', "trader", "retailer", "foodProcessingUnit", "manufacturer", "kissanMitra", "salesPromoter", "soilTestingLab", "stockist" ],
        required: true,
    },
    nameOfServiceProvider: {
        type: String,
        required: true,
    },
    aadharNumber: {
        type: Number,
        required: true,
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
    },
    seqId: { type: Number },
},
    {
        timestamps: true,
    }

);

fieldSchema.plugin(toJSON);
fieldSchema.plugin(paginate);

fieldSchema.pre("save", async function (next) {
    const doc = this;
    doc.seqId = await counterIncrementor("service-provider");
    next();
});

/**
 * @typedef serviceProviderSchema
 */
const serviceProvider = mongoose.model("service-provider", fieldSchema);


module.exports = serviceProvider
