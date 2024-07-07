const mongoose = require("mongoose");
const StoreModel = require("../storeDetail.model");

const getStore = async (userId) => {
    try {
        const storeSearchQuery = {
            active: true,
            userId: new mongoose.Types.ObjectId(userId),
        };

        const store = await StoreModel.findOne(storeSearchQuery);
console.log(store);
        if (!store) {
            return { data: "Store Not Found", status: false, code: 400 };
        } else {
            return { data: store, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getStore;
