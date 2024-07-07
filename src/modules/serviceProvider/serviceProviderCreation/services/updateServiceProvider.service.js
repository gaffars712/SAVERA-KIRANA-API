const ServiceProviderModel = require("../serviceProvider.model");
const mongoose = require("mongoose");

const updateServiceProviderService = async (id, data) => {
    try {
        const userIdSearch = {
            active: true,
            _id: new mongoose.Types.ObjectId(id),
        };
        const serviceProvider = await ServiceProviderModel.findById(id);

        if (!serviceProvider) {
            return { data: "ServiceProvider Not Found", status: false, code: 400 };
        } else {
            const updateResult = await ServiceProviderModel.findOneAndUpdate(
                userIdSearch,
                { ...data },
                { new: true }
            );
            if (updateResult) {
                return { data: updateResult, status: true, code: 200 };
            } else {
                return { data: "ServiceProvider Not Found", status: false, code: 400 };
            }
        }
    } catch (error) {
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = updateServiceProviderService;
