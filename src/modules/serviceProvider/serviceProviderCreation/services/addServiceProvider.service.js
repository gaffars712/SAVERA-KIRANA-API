const ServiceProviderModel = require("../serviceProvider.model");
const mongoose = require("mongoose");

const addServiceProvider = async (data) => {
    try {
        console.log(data);
        if (!data || Object.keys(data).length === 0) {
            return { data: "Nothing to Add", status: false, code: 400 };
        }
        
        const existingProvider = await ServiceProviderModel.find({aadharNumber: data.aadharNumber, active: true})
        console.log(existingProvider);
        if(existingProvider.length > 0){
            return {data: "Aadhar number already exists", status: false, code: 400}
        }

        const userId = new mongoose.Types.ObjectId(data.userId);
        const existingUserId = await ServiceProviderModel.find({ userId: userId, active: true });
        if (existingUserId.length > 0) {
            return { data: "User ID already exists", status: false, code: 400 };
        }
        const addResult = await ServiceProviderModel.create({
            ...data,
            active: true,
            userId: userId,
        });

        if (addResult) {
            return { data: addResult, status: true, code: 200 };
        } else {
            return { data: "Error while adding Service Provider", status: false, code: 400 };
        }
    } catch (error) {
        console.error("Error while adding product:", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = addServiceProvider;
