const ServiceProviderModel = require("../../serviceProviderCreation/serviceProvider.model");
const mongoose = require("mongoose");

const adminUpdateServiceProvider = async ({ id, body }) => {
	try {
		if (body === null || Object.keys(body)?.length === 0) {
			return { data: "Nothing to update", status: false, code: 400 };
		} else {
            let Result = await ServiceProviderModel.findOne({ _id: new mongoose.Types.ObjectId(id), active: true });
			if (!Result) {
				return { data: "data not found", status: false, code: 404 };
			} else {
				await ServiceProviderModel.updateMany(
					{
						userId: new mongoose.Types.ObjectId(Result?.userId),
						active: true,
					},
					{ $set: { isDefault: false } },
					{ new: true }
				);
				let updateResult = await ServiceProviderModel.findOneAndUpdate(
					{ _id: new mongoose.Types.ObjectId(id), active: true },
					{ $set: { ...body, isDefault: true } },
					{ new: true }

				);
				if (updateResult) {
					return { data: updateResult, status: true, code: 200 };
				} else {
					return { data: "data update failed", status: false, code: 400 };
				}
			}
		}
	} catch (error) {
		console.log("Error while updating :", error);
		return { status: false, code: 500, data: error };
	}
};

module.exports = adminUpdateServiceProvider;