const mongoose = require("mongoose");
const StoreModel = require("../storeDetail.model");

const updateStore = async (storeId, reqBody) => {
    try {
        const storeSearchQuery = {
            active: true,
            _id: new mongoose.Types.ObjectId(storeId),
        };

        const store = StoreModel.findById(storeId);

        if (!store) {
            return { data: "Store Not Found", status: false, code: 400 };
        } else {
            const updateResult = await StoreModel.findOneAndUpdate(
                storeSearchQuery,
                { ...reqBody },
                { new: true }
            );
            if (updateResult) {
                return { data: updateResult, status: true, code: 200 };
            } else {
                return { data: "Store Not Found", status: false, code: 400 };
            }
        }
    } catch (error) {
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = updateStore;
