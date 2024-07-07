const BankDetails = require("../bankDetail.model");
const ServiceProviderModel = require("../../serviceProviderCreation/serviceProvider.model");
const mongoose = require("mongoose");

const updateBankDetailsService = async (id, data) => {
    try {
        const bankSearch = {
            active: true,
            _id: new mongoose.Types.ObjectId(id),
        };

        const serviceProvider = await ServiceProviderModel.findById(data.serviceProviderId);
        
        if(!serviceProvider){
            return {data: 'No ServiceProvider Present', status: false, code: 400};
        }

        const bankDetails = await BankDetails.findById(id);

        if (!bankDetails) {
            return { data: "Bank Details Not Found", status: false, code: 400 };
        } else {
            const updateResult = await BankDetails.findOneAndUpdate(
                bankSearch,
                { ...data },
                { new: true }
            );
            if (updateResult) {
                return { data: updateResult, status: true, code: 200 };
            } else {
                return { data: "Error While Updating Bank Details", status: false, code: 400 };
            }
        }
    } catch (error) {
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = updateBankDetailsService;
