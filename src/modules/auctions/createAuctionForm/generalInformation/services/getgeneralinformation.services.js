const { objectId } = require("../../../../../validations/custom.validation");
const AuctionGeneralInfo = require("../generalInformation.model");
const mongoose = require("mongoose");

const getGeneralInformation = async (auctionId) => {
    try {
        const result = await AuctionGeneralInfo.findOne({ _id: new mongoose.Types.ObjectId(auctionId), active: true });
        if (result) {
            return {
                code: 200,
                status: true,
                data: result
            }
        } else {
            return {
                code: 404,
                status: false,
                data: "General information not available!"
            }
        }
    } catch (error) {
        console.error('Error creating auction information:', error.message);
    }

}
module.exports = getGeneralInformation;