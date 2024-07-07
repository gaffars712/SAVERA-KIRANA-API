const httpStatus = require("http-status");
const catchAsync = require("../../../../utils/catchAsync");
const pick = require("../../../../utils/pick");
const { sendResponse } = require("../../../../utils/responseHandler");
const Services = require("../services");

const addServiceProvider = catchAsync(async (req, res) => {
	const userId = req?.user?.id;

	let { serviceProviderRole, nameOfServiceProvider, aadharNumber} =
		await pick(req.body, ["serviceProviderRole", "nameOfServiceProvider", "aadharNumber"]);
	let addResult = await Services.addServiceProvider({
		userId: userId,
		serviceProviderRole, nameOfServiceProvider, aadharNumber
	});

	if (addResult?.code === 200) {
		sendResponse(res, httpStatus.OK, addResult?.data, null);
	}  else if (addResult.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, addResult.data);
      } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, addResult.data);
      }
});

module.exports = addServiceProvider;