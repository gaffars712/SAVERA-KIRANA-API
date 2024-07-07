const mongoose = require("mongoose");

const counterIncrementor = require("../../../../utils/counterIncrementer");
const { toJSON, paginate } = require("../../../../models/plugins");

const warehouseAddressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.SchemaTypes.ObjectId,
        },
        deliverFrom: {
            type: String,
            required: true,
        },
        nameOfWarehouse: {
            type: String,
            required: true,
        },
        warehouseNumber: {
            type: String,
            required: true,
        },
        auctionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        address: {
            street: {
                type: String,
                required: true,
            },
            landmark: {
                type: String,
                required: true,
            },
            pincode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
        },
        active: {
            type: Boolean,
            default: true,
        },
        seqId: {
            type: Number,
        },
    },
    {
        timestamps: true,
    }
);

warehouseAddressSchema.plugin(toJSON);
warehouseAddressSchema.plugin(paginate);

warehouseAddressSchema.pre("save", async function (next) {
    const doc = this;
    doc.seqId = await counterIncrementor("warehouse-address");
    next();
});

/**
 * @typedef Warehouse
 */
const Warehouse = mongoose.model("warehouse-address", warehouseAddressSchema);

module.exports = Warehouse;
