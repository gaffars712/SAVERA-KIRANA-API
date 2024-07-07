const WarehouseModel = require("../warehouseAddress.model");
const AUCTION_GENERAL_INFO_MODEL = require('../../generalInformation/generalInformation.model');
const mongoose = require("mongoose");

const add = async (data) => {
    try {
        const existingAuctionGenralInfo = await AUCTION_GENERAL_INFO_MODEL.findOne({ _id: new mongoose.Types.ObjectId(data.auctionId) });
        if (!existingAuctionGenralInfo) {
            return { data: "Auction General Info not found", status: false, code: 400 };
        }
        const userId = new mongoose.Types.ObjectId(data.userId);
        const addResult = await WarehouseModel.create({
            ...data,
            active: true,
            userId: new mongoose.Types.ObjectId(userId),
        });

        if (addResult) {
            return { data: addResult, status: true, code: 200 };
        } else {
            return {
                data: "Error while adding Warehouse",
                status: false,
                code: 400,
            };
        }
    } catch (error) {
        console.error("Error while adding Warehouse", error);
        return { status: false, code: 500, data: error.message };
    }
};

module.exports = add;
