const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { sendResponse } = require('../../../utils/responseHandler');
const userService = require('../services/index');
const pick = require('../../../utils/pick');


const sendPhoneUpdateOTP = catchAsync(async (req, res) => {
    const { phone } = await pick(req.body, ["phone"]);
    const userId = req.user.id;
    const user = await userService.sendPhoneUpdateOTP(phone, userId);
    if (user.status) {
        sendResponse(res, httpStatus.OK, { token: user.token }, null);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, user.msg);
    }
});

module.exports = sendPhoneUpdateOTP;