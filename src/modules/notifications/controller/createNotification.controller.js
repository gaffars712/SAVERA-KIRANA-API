const httpStatus = require("http-status");
const catchAsync = require("../../../utils/catchAsync");
const pick = require("../../../utils/pick");
const { sendResponse } = require("../../../utils/responseHandler");
const Services = require("../services");


// createNotification('hellow from api','66828ab28ec136a7d3b29cd5' )
const createNotification = async (title, message, userId) => {

    let addResult = await Services.createNotification({
        userId: userId,
        message,
        title
    });

    if (addResult?.code === 200) {
        return addResult
    } else if (addResult.code == 500) {
        return addResult
    } else {
        return addResult
    }
};

module.exports = createNotification;