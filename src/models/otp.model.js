const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const counterIncrementor = require("../utils/counterIncrementer");

const OtpSchema = mongoose.Schema(
	{
		userId: {
			type: mongoose.SchemaTypes.ObjectId,
			required: true,
		},
		phone: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			required: true,
		},
		otp: {
			type: Number,
			required: true,
		},
		expires: {
			type: Date,
		},
		seqId: { type: Number },
	},
	{
		timestamps: true,
	}
);
// add plugin that converts mongoose to json
OtpSchema.plugin(toJSON);
OtpSchema.plugin(paginate);

OtpSchema.pre("save", async function (next) {
	const doc = this;
	doc.seqId = await counterIncrementor("Otp");
	next();
});

/**
 * @typedef OtpSchema
 */
const OTP = mongoose.model("Otp", OtpSchema);
module.exports = OTP;
