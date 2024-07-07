const httpStatus = require("http-status");
const catchAsync = require("../../../../utils/catchAsync");
const pick = require("../../../../utils/pick");
const { sendResponse } = require("../../../../utils/responseHandler");
const Services = require("../services");

const adminUpdateServiceProvider = catchAsync(async (req, res) => {

    const { id } = await pick(req.params, ["id"]);
	const body = req?.body || null;

	    const updateResult = await Services.adminUpdateServiceProvider({id, body});

    if (updateResult?.code === 200) {
        sendResponse(res, httpStatus.OK, updateResult?.data, null);
    } else if (updateResult?.code === 400) {
        sendResponse(res, httpStatus.BAD_REQUEST, updateResult?.data, null);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, updateResult?.data, null);
    }
});

module.exports = adminUpdateServiceProvider;