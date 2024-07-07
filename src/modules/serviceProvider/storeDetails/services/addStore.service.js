const StoreModel = require("../storeDetail.model");
const ServiveProvider = require("../../serviceProviderCreation/serviceProvider.model");
const mongoose = require("mongoose");

const add = async (data) => {
    try {
        const userId = new mongoose.Types.ObjectId(
            data.userId
        );

        const addResult = await StoreModel.create({
            ...data,
            userId
        });

        if (addResult) {
           
            return { data: addResult, status: true, code: 200 };
        } else {
            return {
                msg: "Error while adding Store",
                status: false,
                code: 400,
            };
        }
    } catch (error) {
        console.error("Error while adding store:", error);
        return { status: false, code: 500, msg: error.message };
    }
};

module.exports = add;
