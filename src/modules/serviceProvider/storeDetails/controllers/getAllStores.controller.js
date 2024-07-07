const httpStatus = require("http-status");
const catchAsync = require("../../../../utils/catchAsync");
const pick = require("../../../../utils/pick");
const { sendResponse } = require("../../../../utils/responseHandler");
const services = require("../services");

const getAllStore = catchAsync(async (req, res) => {


    const result = await services.getAllStore();
    
    if (result?.code === 200) {
        sendResponse(res, httpStatus.OK, result?.data, null);
    } else if (result?.code === 400) {
        sendResponse(res, httpStatus.BAD_REQUEST, result?.data, null);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, result?.data, null);
    }
});

module.exports = getAllStore;
