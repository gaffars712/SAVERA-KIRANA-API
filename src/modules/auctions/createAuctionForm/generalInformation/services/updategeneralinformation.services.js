const { objectId } = require("../../../../../validations/custom.validation");
const AuctionGeneralInfo = require("../generalInformation.model");
const mongoose = require("mongoose");

const updateGeneralInformation = async (body, id) => {
    try {
        const configerFilter = {
            _id: new mongoose.Types.ObjectId(id),
            active: true
        }
        const find = await AuctionGeneralInfo.findById(configerFilter);
        if (!find) {
            return{
                code:404,
                status:false,
                data:"Sorry, no data was found for the provided ID."
            }

        } else if (find) {

            const result = await AuctionGeneralInfo.findOneAndUpdate(
                configerFilter,
                { ...body },
                { new: true }
            );
            console.log('result', result)
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
        }
    } catch (error) {
        console.error('Error creating auction information:', error.message);
    }

}
module.exports = updateGeneralInformation;