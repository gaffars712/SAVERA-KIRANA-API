const httpStatus = require("http-status");
const catchAsync = require("../../../../utils/catchAsync");
const { sendResponse } = require("../../../../utils/responseHandler");
const Services = require("../services");

const adminupdateBankDetails = catchAsync(async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    if (!id || !body) {
        return sendResponse(res, httpStatus.BAD_REQUEST, "Invalid input: 'id' and 'body' are required.", null);
    }

    const updateResult = await Services.adminupdateBankDetails({ id, data: body });

    if (updateResult?.code === 200) {
        sendResponse(res, httpStatus.OK, updateResult?.data, null);
    } else if (updateResult?.code === 400) {
        sendResponse(res, httpStatus.BAD_REQUEST, updateResult?.data, null);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, updateResult?.data, null);
    }
});

module.exports = adminupdateBankDetails;
