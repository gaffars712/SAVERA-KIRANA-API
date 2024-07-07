const TimePaymentModel = require('../timeAndPaymentInfo.model')
const AUCTION_GENERAL_INFO_MODEL = require('../../generalInformation/generalInformation.model');
const mongoose = require('mongoose');
const { createNotification } = require('../../../../notifications/controller');
/***
 * Create a Series  of shipping
 * @param {Object} shippingData
 * @returns {Promise<Object>}
 **/
const addTimeandPaymentInfo = async (data) => {
    try {
        const existingAuctionGenralInfo = await AUCTION_GENERAL_INFO_MODEL.findOne({ _id: new mongoose.Types.ObjectId(data.auctionId) });
        if (!existingAuctionGenralInfo) {
            return { data: "Auction General Info not found", status: false, code: 400 };
        }
        const addResult = await TimePaymentModel.create({ ...data, userId: data.userId });
        if (addResult) {
            await createNotification(`${existingAuctionGenralInfo?.commodity?.variety + " " + existingAuctionGenralInfo?.commodity?.commodityType + " "} Auction Created`, `Your  ${existingAuctionGenralInfo?.commodity?.variety + " " + existingAuctionGenralInfo?.commodity?.commodityType + " "} auction has been successfully saved. An admin will review it shortly.`, data?.userId)
            await createNotification(`${existingAuctionGenralInfo?.commodity?.variety + " " + existingAuctionGenralInfo?.commodity?.commodityType + " "} Auction Verified`, `Your ${existingAuctionGenralInfo?.commodity?.variety + " " + existingAuctionGenralInfo?.commodity?.commodityType + " "} auction details have been verified. Your auction is now live.`, data?.userId)

            return { data: addResult, status: true, code: 200 };
        } else {
            return { data: "Could not add", status: false, code: 400 };
        }

    } catch (err) {
        return { data: err.message, status: false, code: 500 }
    }
};

module.exports = addTimeandPaymentInfo;
