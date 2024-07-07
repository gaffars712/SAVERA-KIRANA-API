const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const pick = require("../../../utils/pick");
const { sendResponse } = require("../../../utils/responseHandler");
const Services = require("../services");

const updateCartItemController = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const body = pick(req.body, [
        "productId","quantity" 
    ]);

    let Result = await Services.updateCartItemService(userId, body);

    if (Result?.code === 200) {
        sendResponse(res, httpStatus.OK, Result?.data, null);
    } else if (Result.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, Result.data);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, Result.data);
    }
});

module.exports = updateCartItemController;