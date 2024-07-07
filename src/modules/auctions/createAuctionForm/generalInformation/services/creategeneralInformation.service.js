const AuctionGeneralInfo = require("../generalInformation.model");
const USER_MODEL = require("../../../../../models/user.model");
const mongoose = require("mongoose");

const creategeneralInformation = async (body, userId) => {
    try {
        const serviceProvider = await USER_MODEL.findOne({
            _id: new mongoose.Types.ObjectId(userId),
            isServiceProvider: true,
            serviceProviderId: new mongoose.Types.ObjectId(body.serviceProviderId)
        });
        if (!serviceProvider) {
            return {
                code: 400,
                status: false,
                data: "User is not a service provider"
            }
        }
        const result = await AuctionGeneralInfo.create({ ...body, userId: new mongoose.Types.ObjectId(userId) });
        if (result) {
            return {
                code: 200,
                status: true,
                data: result
            }
        } else {
            return {
                code: 500,
                status: false,
                data: "Something Wrong try again letter"
            }
        }
    } catch (error) {
        console.error('Error creating auction information:', error.message);
    }

}
module.exports = creategeneralInformation;