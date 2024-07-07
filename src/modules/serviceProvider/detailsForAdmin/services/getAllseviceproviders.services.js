const mongoose  = require("mongoose");
const ServiceProviderModel = require("../../serviceProviderCreation/serviceProvider.model");

const admingetServiceProviderService = async () => {
    try {
        const filterQuery = {
            active: true,
        };

        const customPipeline = [
			{
				$match: filterQuery,
			},

            {
                $lookup: {
                    from: 'bank-details',
                    localField: '_id', // The field from the serviceProviders collection
                    foreignField: 'serviceProviderId', // The field from the bankDetails collection
                    as: 'bankDetails' // Alias for the joined documents
                }
            },
            {
                $lookup: {
                    from: 'stores',
                    localField: '_id', // The field from the serviceProviders collection
                    foreignField: 'serviceProviderId', // The field from the bankDetails collection
                    as: 'Store' // Alias for the joined documents
                }
            },
			
		];

        const serviceProvider = await ServiceProviderModel.aggregate(customPipeline);
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

module.exports = admingetServiceProviderService;
