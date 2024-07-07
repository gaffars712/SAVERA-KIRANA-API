const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const { sendResponse } = require("../../../utils/responseHandler");
const userServices = require('../services/index');

const getUsers = catchAsync(async (req, res) => {
	const { page, limit, filter, sort} = req.query;

	let filter_Json_data = filter ? convertToJSON(filter.query) : undefined;
	let result = await userServices.getUsers(page, limit, filter_Json_data, sort);
	if (result.status) {
		sendResponse(res, httpStatus.OK, {
			data: result?.data,
			totalResults: result?.totalResults,
			totalPages: result?.totalPages,
			page: result?.page,
			limit: result?.limit
		}, null);
	} else {
		if (result?.code === 400) {
			sendResponse(res, httpStatus.BAD_REQUEST, null, result?.data);
		} else if (result?.code === 500) {
			sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, result?.data);
		} else {
			sendResponse(res, httpStatus.BAD_REQUEST, null, result);
		}
	}
});

module.exports = getUsers;