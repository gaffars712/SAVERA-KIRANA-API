const httpStatus = require("http-status");
const catchAsync = require("../../../../../src/utils/catchAsync");
const pick = require("../../../../../src/utils/pick");
const { sendResponse } = require("../../../../../src/utils/responseHandler");
const Services = require("../services");

const getAllAuction = catchAsync(async (req, res) => {

    let Result = await Services.getAllAuction();

    if (Result?.code === 200) {
        sendResponse(res, httpStatus.OK, Result?.data, null);
    } else if (Result.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, Result.data);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, Result.data);
    }
});

module.exports = getAllAuction;