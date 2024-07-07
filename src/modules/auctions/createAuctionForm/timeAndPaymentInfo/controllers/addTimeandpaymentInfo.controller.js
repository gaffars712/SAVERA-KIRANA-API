const httpStatus = require('http-status');
const Services = require("../services");
const pick = require('../../../../../utils/pick');
const catchAsync = require('../../../../../utils/catchAsync');
const { sendResponse } = require('../../../../../utils/responseHandler');
const moment = require("moment");

const TimeandPaymentInfo = catchAsync(async (req, res) => {
	const userId = req.user.id;
    const {
        StartDate,
        EndDate,
        bank,
        userName,
        IFSCCode,
        accountNumber,
        auctionId

    } = await pick(req.body,
        [
            "StartDate",
            "EndDate",
            "bank",
            "userName",
            "IFSCCode",
            "accountNumber",
            "auctionId"
           
        ]);

        const formattedStartDate = moment(StartDate).format('YYYY-MM-DD');
        const formattedEndDate = moment(EndDate).format('YYYY-MM-DD');


    const insertResult = await Services.TimeandPaymentInfo({
        startDate : formattedStartDate,
        endDate:formattedEndDate,
        bank,
        userName,
        IFSCCode,
        accountNumber,
        auctionId,
        userId: userId
       
    });
    if (insertResult.status) {
        sendResponse(res, httpStatus.OK, insertResult.data, null);
    } else {
        if (insertResult.code == 400) {
            sendResponse(res, httpStatus.BAD_REQUEST, null, insertResult.data);
        }
        else if (insertResult.code == 500) {
            sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, insertResult.data);
        }
        else {
            sendResponse(res, httpStatus.BAD_REQUEST, null, insertResult.data);
        }
    }
});

module.exports = TimeandPaymentInfo