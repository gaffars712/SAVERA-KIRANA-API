const mongoose  = require("mongoose");
const ServiceProviderModel = require("../serviceProvider.model");

const getServiceProviderService = async (serviceProviderId) => {
    try {
        const ServiceProviderSearchQuery = {
            active: true,
            userId: new mongoose.Types.ObjectId(serviceProviderId),
        };
        const serviceProvider = await ServiceProviderModel.findOne(ServiceProviderSearchQuery);
        if (!serviceProvider) {
            return { data: "serviceProvider Not Found", status: false, code: 400 };
        } else {
            return { data: serviceProvider, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getServiceProviderService;
