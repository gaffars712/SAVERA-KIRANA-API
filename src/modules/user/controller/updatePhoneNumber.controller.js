const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { sendResponse } = require('../../../utils/responseHandler');
const userService = require('../services/index');
const pick = require('../../../utils/pick');

const updatePhoneNumber = catchAsync(async (req, res) => {
    const { token, phone, otp } = await pick(req.body, ["token", "phone", "otp"]);
    const otpResponse = await userService.updatePhoneNumber(phone, token, otp);

    if (otpResponse.code == 200) {
        sendResponse(res, httpStatus.OK, { user: otpResponse.data }, null);
    } else if (otpResponse.code == 400) {
        sendResponse(res, httpStatus.BAD_REQUEST, null, otpResponse.msg);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, otpResponse.msg);
    }
});

module.exports = updatePhoneNumber;