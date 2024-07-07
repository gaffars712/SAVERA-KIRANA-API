const httpStatus = require("http-status");
const catchAsync = require("../../../../utils/catchAsync");
const pick = require("../../../../utils/pick");
const { sendResponse } = require("../../../../utils/responseHandler");
const services = require("../services");

const addStore = catchAsync(async (req, res) => {
    const userId = req?.user?.id;

    let {
        bannerImage,
        profileImage,
        storeName,
        storeURL,
        storeTags,
        description,
        storeAddress,
        gstNumber,
        serviceProviderId,
    } = await pick(req.body, [
        "bannerImage",
        "profileImage",
        "storeName",
        "storeURL",
        "storeTags",
        "description",
        "storeAddress",
        "gstNumber",
        "serviceProviderId"
    ]);

    let addResult = await services.addStore({
        bannerImage,
        profileImage,
        storeName,
        storeURL,
        storeTags,
        description,
        storeAddress,
        gstNumber,
        userId,
        serviceProviderId
    });

    if (addResult?.code === 200) {
        sendResponse(res, httpStatus.OK, addResult?.data, null);
    } else if(addResult?.code === 400) {
        sendResponse(res, httpStatus.BAD_REQUEST, addResult?.msg, null);
    }else{
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR. addResult?.msg, null);
    }
});

module.exports = addStore;
