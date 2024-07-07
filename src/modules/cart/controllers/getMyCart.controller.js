const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const { sendResponse } = require("../../../utils/responseHandler");
const Services = require("../services");

const getMyCart = catchAsync(async (req, res) => {

    const userId = req.user.id;

    let result = await Services.getMyCart( userId);

    if (result?.code === 200) {
        sendResponse(res, httpStatus.OK, result?.data, null);
    } else if (result.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, result.data);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, result.data);
    }
});

module.exports = getMyCart;