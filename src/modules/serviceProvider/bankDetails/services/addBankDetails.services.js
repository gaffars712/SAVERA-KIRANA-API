const BankDetailsModal = require("../bankDetail.model");
const mongoose = require("mongoose");
const ServiveProvider = require('../../serviceProviderCreation/serviceProvider.model');
const USER_MODEL = require('../../../../models/user.model');
const { createNotification } = require("../../../notifications/controller");
const addBankDetailsService = async (data) => {

    try {
        if (!data || Object.keys(data).length === 0) {
            return { data: "Nothing to Add", status: false, code: 400 };
        }

        const serviceProvider = await ServiveProvider.findById(data.serviceProviderId);

        if (!serviceProvider) {
            return { data: 'No ServiceProvider Present', status: false, code: 400 };
        }

        const addResult = await BankDetailsModal.create({
            ...data,
            active: true,
        });

        if (addResult) {
            await createNotification('Service Provider Profile Submitted', 'Your profile has been successfully saved. An admin will review it shortly.', data?.userId)
            await createNotification('Service Provider Profile Verified', 'Your profile has been verified. You can now access all service provider features.', data?.userId)
            const updateUserToSeriviceProvider = await USER_MODEL.findOneAndUpdate({ _id: new mongoose.Types.ObjectId(data?.userId), active: true }, { isServiceProvider: true, serviceProviderId: new mongoose.Types.ObjectId(data?.serviceProviderId) }, { new: true })
            return { data: { bankDetail: addResult, user: updateUserToSeriviceProvider }, status: true, code: 200 };
        } else {
            return { data: "Error while adding Bank Details", status: false, code: 400 };
        }
    } catch (error) {
        console.error("Error while adding Details:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = addBankDetailsService;
