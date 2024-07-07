const mongoose = require('mongoose');
const { toJSON, paginate } = require('../../../models/plugins');
const counterIncrementor = require('../../../utils/counterIncrementer');

const bankDetailsSchema = new mongoose.Schema({

    bankName: {
        type: String,
        required: true,
    },
    bankHolderName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
    },
    IFSCCode: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
    },
    serviceProviderId: {
        type: mongoose.SchemaTypes.ObjectId,
    },
    seqId:{
        type:Number
    },
    active: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

/**
 * @typedef BankDetails
 */
bankDetailsSchema.plugin(toJSON);
bankDetailsSchema.plugin(paginate);

bankDetailsSchema.pre("save", async function (next) {
    const doc = this;
    doc.seqId = await counterIncrementor("bank-details");
    next();
});

/**
 * @typedef Store
 */
const BankDetails = mongoose.model('bank-details', bankDetailsSchema);

module.exports = BankDetails;
