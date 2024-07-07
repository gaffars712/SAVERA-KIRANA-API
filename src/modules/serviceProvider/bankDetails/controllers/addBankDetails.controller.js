const httpStatus = require("http-status");
const catchAsync = require("../../../../utils/catchAsync");
const pick = require("../../../../utils/pick");
const { sendResponse } = require("../../../../utils/responseHandler");
const addBankDetailsService = require("../services");

const addBankDetailsController = catchAsync(async (req, res) => {
	let { bankName, bankHolderName, accountNumber, IFSCCode, serviceProviderId} =
		await pick(req.body, [ "bankName", "bankHolderName", "accountNumber", "IFSCCode", "serviceProviderId"]);
		const userId = req.user.id
	let bankDetails = await addBankDetailsService.addBankDetailsService({serviceProviderId, bankName, bankHolderName, accountNumber, IFSCCode, userId});

	if (bankDetails?.code === 200) {
		sendResponse(res, httpStatus.OK, bankDetails?.data, null);
	}  else if (bankDetails.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, bankDetails.data);
      } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, bankDetails.data);
      }
});

module.exports = addBankDetailsController;