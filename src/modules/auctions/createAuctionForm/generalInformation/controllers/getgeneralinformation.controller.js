const httpStatus = require("http-status");
const catchAsync = require("../../../../../utils/catchAsync");
const pick = require("../../../../../utils/pick");
const { sendResponse } = require("../../../../../utils/responseHandler");
const Services = require("../services");

const getGeneralInformation = catchAsync(async (req, res) => {
    const userId  = req.user.id
    const id = pick(req.params, ["id"])
    let Result = await Services.getGeneralInformation( id);

    if (Result?.code === 200) {
        sendResponse(res, httpStatus.OK, Result?.data, null);
    } else if (Result.code == 404) {
        sendResponse(res, httpStatus.NOT_FOUND, null, Result.data);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, Result.data);
    }
});

module.exports = getGeneralInformation;