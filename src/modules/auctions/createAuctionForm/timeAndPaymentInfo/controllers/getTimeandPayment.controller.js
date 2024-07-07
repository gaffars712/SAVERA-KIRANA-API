const httpStatus = require('http-status');
const pick = require('../../../../../utils/pick');
const { sendResponse } = require("../../../../../utils/responseHandler");
const Services = require("../services");
const catchAsync = require('../../../../../utils/catchAsync');

const getTimeandPayment = catchAsync(async (req, res) => {
    const userId = req.user.id
    const id = pick(req.params, ["id"])

    const insertResult = await Services.getTimeandPayment(id);

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

module.exports = getTimeandPayment