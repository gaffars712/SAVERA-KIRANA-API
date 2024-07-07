const mongoose = require("mongoose");
const counterIncrementor = require("../../../utils/counterIncrementer");

const { toJSON, paginate } = require("../../../models/plugins");

const storeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
  },
    bannerImage: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    storeName: {
      type: String,
      required: true,
    },
    storeURL: {
      type: String,
    },
    storeTags: {
      type: [String],
      required: true,
    },
    description: {
      type: String,
    },
    storeAddress: {
      type: [String],
      required: true,
    },
    gstNumber: {
      type: String,
      required: true,
    },
    serviceProviderId: {
      type: mongoose.SchemaTypes.ObjectId,
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

storeSchema.plugin(toJSON);
storeSchema.plugin(paginate);

storeSchema.pre("save", async function (next) {
  const doc = this;
  doc.seqId = await counterIncrementor("store-detail");
  next();
});

/**
 * @typedef Store
 */
const Store = mongoose.model("store-detail", storeSchema);

module.exports = Store;
