const mongoose = require("mongoose");
const warehouseModel = require("../warehouseAddress.model");

const getWarehouse = async (auctionId) => {
    try {
        const warehouseSearchQuery = {
            active: true,
            auctionId: new mongoose.Types.ObjectId(auctionId),
        };

        const warehouse = await warehouseModel.findOne(warehouseSearchQuery);
   
        if (!warehouse) {
            return { data: "Warehouse Not Found", status: false, code: 400 };
        } else {
            return { data: warehouse, status: true, code: 200 };
        }
    } catch (error) {
        console.log(error);
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = getWarehouse;
