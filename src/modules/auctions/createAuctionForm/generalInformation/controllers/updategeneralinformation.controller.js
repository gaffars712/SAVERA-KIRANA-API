const httpStatus = require("http-status");
const catchAsync = require("../../../../../utils/catchAsync");
const pick = require("../../../../../utils/pick");
const { sendResponse } = require("../../../../../utils/responseHandler");
const Services = require("../services");

const updateGeneralInformation = catchAsync(async (req, res) => {
    const body = pick(req.body, [
        "procurementType",
        "auctionType",
        "commodity",
        "commodityImages",
        "qualityCertificate",
        "priceInformation",
        "productSpecification",
        "serviceProviderId",
        "warehouseAddressId",
        "timeAndPaymentId",

    ]);
    const id = pick(req.params, ["id"])

    let Result = await Services.updateGeneralInformation(body, id);

    if (Result?.code === 200) {
        sendResponse(res, httpStatus.OK, Result?.data, null);
    } else if (Result.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, Result.data);
    } else if (Result.code == 404) {
        sendResponse(res, httpStatus.NOT_FOUND, null, Result.data);
    } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, Result.data);
    }
});

module.exports = updateGeneralInformation;