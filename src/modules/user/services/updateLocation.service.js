const mongoose = require('mongoose');
const { User } = require("../../../models");

const updateUserLocation = async (userLocation, userId) => {
    try {
        let filterQuery = { _id: new mongoose.Types.ObjectId(userId), active: true }
        const bodyData = { userLocation: userLocation }

        const updatedResult = await User.findOneAndUpdate(filterQuery, bodyData, { new: true })
        if (updatedResult) {
            return { data: updatedResult, status: true, code: 200 };
        } else {
            return { msg: "User not found", status: false, code: 400 };
        }
    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
}

module.exports = updateUserLocation;
