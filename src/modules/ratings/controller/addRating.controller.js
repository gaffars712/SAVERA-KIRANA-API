const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const pick = require("../../../utils/pick");
const { sendResponse } = require("../../../utils/responseHandler");
const Services = require("../services");

const addRating = catchAsync(async (req, res) => {
    const userId = req?.user?.id;
    const body = pick(req.body, [
        "productId",
        "rating"
    ]);
    let result = await Services.addRating(body, userId);

    if (result?.code === 200) {
        sendResponse(res, httpStatus.OK, result?.data, null);
    } else if (result.code == 201) {
        sendResponse(res, httpStatus.CREATED, result?.data, null);
    } else if (result.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, result.data);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, result.data);
    }
});

module.exports = addRating;