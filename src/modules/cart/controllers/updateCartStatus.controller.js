const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const pick = require("../../../utils/pick");
const { sendResponse } = require("../../../utils/responseHandler");
const Services = require("../services");

const updateCartStatus = catchAsync(async (req, res) => {
    const body = pick(req.body, [
        "status"
    ]);
    const cartId = pick(req.params, [
        "cartId"
    ])

    let Result = await Services.updateCartStatus(body, cartId?.cartId);

    if (Result?.code === 200) {
        sendResponse(res, httpStatus.OK, Result?.data, null);
    } else if (Result.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, Result.data);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, Result.data);
    }
});

module.exports = updateCartStatus;