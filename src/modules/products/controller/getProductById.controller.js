const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { sendResponse } = require('../../../utils/responseHandler');
const services = require('../services');
const pick = require('../../../utils/pick');
const { filter } = require('compression');

const getProductByIdController = catchAsync(async (req, res) => {
    const {id} = pick(req.params, ["id"])
    console.log(id);
    const result = await services.getProductByIdService(id);

    if (result?.code === 200) {
        sendResponse(res, httpStatus.OK, result?.data, null);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, result?.data, null);
    }
});

module.exports = getProductByIdController;
