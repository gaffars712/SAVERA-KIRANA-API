const mongoose = require('mongoose');
const { User } = require("../../../models");
const { tokenService } = require('../../../services');
const OTP = require('../../../models/otp.model');

const updatePhoneNumber = async (phone, token, otp) => {
    try {
        const currentDate = new Date()
        const isTokenExpired = tokenService.isTokenExpired(token)
        if (isTokenExpired == true) {
            return { msg: "OTP has expired. Please request a new one", status: false, code: 400 };
        }
        const tokenResponse = await tokenService.verifyOtpToken(token);
        const tokenUser = await OTP.findOne({ userId: new mongoose.Types.ObjectId(tokenResponse?._id), type: "phoneNumberChange" }).sort({ _id: -1 }) || null;
        if (tokenUser) {
            if (otp == tokenUser.otp) {
                if (currentDate > tokenUser.expires) {
                    return { msg: "OTP has expired. Please request a new one", status: false, code: 400 };
                }
                let filterQuery = { _id: new mongoose.Types.ObjectId(tokenResponse?._id), active: true }
                const phoneAlreadyExists = await User.findOne({ phone: phone, active: true})
                if(phoneAlreadyExists){
                    return { msg: "Phone number already exists", status: false, code: 400 };
                }
                const updatedResult = await User.findOneAndUpdate(
                    filterQuery,
                    { $set: { phone: phone } },
                    { new: true, upsert: true }
                );
                if (updatedResult) {
                    await OTP.deleteMany({ userId: new mongoose.Types.ObjectId(tokenResponse?._id), type: "phoneNumberChange" });
                    const user = await User.findOne({ _id: new mongoose.Types.ObjectId(tokenResponse?._id), active: true })
                    return { data: user, status: true, code: 200 };
                }
            } else {
                return { msg: "Invalid OTP", status: false, code: 400 };
            }
        } else {
            return { msg: "No OTP found for this Phone Number", status: false, code: 400 };
        }
    } catch (error) {
        return { msg: error.message, status: false, code: 500 };
    }
}

module.exports = updatePhoneNumber
