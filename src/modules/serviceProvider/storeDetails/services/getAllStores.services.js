const mongoose = require("mongoose");
const StoreModel = require("../storeDetail.model");
const UserModel = require("../../../../models/user.model");

const getStoresForServiceProviders = async () => {
    try {
        const serviceProviders = await UserModel.find({
            active: true,
            isServiceProvider: true
        });

        if (!serviceProviders || serviceProviders.length === 0) {
            return { data: "No service providers found", status: false, code: 400 };
        }

        const serviceProviderIds = serviceProviders.map(provider => provider.serviceProviderId);

        const stores = await StoreModel.aggregate([
            {
                $match: {
                    active: true,
                    serviceProviderId: { $in: serviceProviderIds }
                }
            },
            {
                $lookup: {
                    from: "products", // Assuming "products" is the name of your products collection
                    localField: "serviceProviderId",
                    foreignField: "serviceProviderId",
                    as: "products"
                }
            },
            {
                $addFields: {
                    productCount: { $size: "$products" }
                }
            }
        ]);

        if (!stores || stores.length === 0) {
            return { data: "Stores not found for the given service providers", status: false, code: 400 };
        }

        return { data: stores, status: true, code: 200 };
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getStoresForServiceProviders;
