const mongoose = require("mongoose");
const WarehouseModel = require("../warehouseAddress.model");

const updateWarehouse = async (warehouseId, reqBody) => {
    try {
        const warehouseSearchQuery = {
            active: true,
            _id: new mongoose.Types.ObjectId(warehouseId),
        };

        const warehouse = WarehouseModel.findById(warehouseId);

        if (!warehouse) {
            return { data: "warehouse Not Found", status: false, code: 400 };
        } else {
            const updateResult = await WarehouseModel.findOneAndUpdate(
                warehouseSearchQuery,
                { ...reqBody },
                { new: true }
            );
            if (updateResult) {
                return { data: updateResult, status: true, code: 200 };
            } else {
                return { data: "warehouse Not Found", status: false, code: 400 };
            }
        }
    } catch (error) {
        return { data: error.message, status: false, code: 500 };
    }
};

module.exports = updateWarehouse;
