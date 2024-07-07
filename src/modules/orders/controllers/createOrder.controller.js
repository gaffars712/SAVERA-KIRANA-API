const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const pick = require("../../../utils/pick");
const { sendResponse } = require("../../../utils/responseHandler");
const Services = require("../services");

const createOrder = catchAsync(async (req, res) => {
	const userId = req?.user?.id;
	const body = pick(req.body, [
		"cartId",
        "cartTotalAmount",
        "deliveryCharge",
        "packagingCharge",
        "discountAmount",
        "address",
        "totalAmount",
		"deliveryExpectedDate"
	]);
	let result = await Services.createOrder(body, userId);

	if (result?.code === 200) {
		sendResponse(res, httpStatus.OK, result?.data, null);
	} else if (result.code == 500) {
		sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, result.data);
	} else {
		sendResponse(res, httpStatus.BAD_REQUEST, null, result.data);
	}
});

module.exports = createOrder;