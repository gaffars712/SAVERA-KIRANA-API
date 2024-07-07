const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const pick = require("../../../utils/pick");
const { sendResponse } = require("../../../utils/responseHandler");
const Services = require("../services");

const deleteNotification = catchAsync(async (req, res) => {
    const userId = req.params?.userId
    const result = await Services.deleteNotification(userId);
    if (result?.code === 200) {
        sendResponse(res, httpStatus.OK, result?.data, null);
    } else if (result?.code === 400) {
        sendResponse(res, httpStatus.BAD_REQUEST, result?.data, null);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, result?.data, null);
    }
});

module.exports = deleteNotification;
