const mongoose = require("mongoose");
const counterIncrementor = require("../../../../utils/counterIncrementer");
const { toJSON, paginate } = require("../../../../models/plugins");

const TimeAndPaymentInfoSchema = new mongoose.Schema(
    {
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        bank: {
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
        userName: {
            type: String,
            required: true,
        },

        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        seqId:{
            type : Number
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

TimeAndPaymentInfoSchema.plugin(toJSON);
TimeAndPaymentInfoSchema.plugin(paginate);

TimeAndPaymentInfoSchema.pre("save", async function (next) {
    const doc = this;
    doc.seqId = await counterIncrementor("time-payment-information");
    next();
});

/**
 * @typedef TimeAndPaymentInfo
 */
const TimeAndPaymentInfo = mongoose.model(
    "time-payment-information",
    TimeAndPaymentInfoSchema
);

module.exports = TimeAndPaymentInfo;
