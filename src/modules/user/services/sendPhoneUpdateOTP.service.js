const mongoose = require('mongoose');
const { User } = require("../../../models");
const moment = require('moment');
const { tokenTypes } = require('../../../config/tokens');
const { sendOtp } = require('../../../services/auth.service');
const httpStatus = require('http-status');


const sendPhoneUpdateOTP = async ( phone, userId) => {
    let user = await User.findOne({ _id: new mongoose.Types.ObjectId(userId),  active: true });
    if (!user) {
        return { user: null, msg: 'User Not Found !' };
    } else {
        // let generatedOtp = Math.floor(Math.random() * 9000) + 1000;
        let generatedOtp = 1234;
        const expires = moment().add(5, 'minutes');
        const createOtpdoc = {
            userId: new mongoose.Types.ObjectId(userId),
            type: tokenTypes.PHONE_NUMBER_CHANGE,
            phone: phone,
            otp: generatedOtp,
            expires
        }
        let otpResponse = await sendOtp(createOtpdoc)
        if (!otpResponse.status) {
            return { user: null, msg: otpResponse.msg };
        } else {
            return { token: otpResponse.data, code: httpStatus.OK, status: true };
        }
    }
};

module.exports = sendPhoneUpdateOTP;

















