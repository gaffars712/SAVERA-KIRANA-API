const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { sendResponse } = require('../../../utils/responseHandler');
const services = require('../services');
const pick = require('../../../utils/pick');
const { filter } = require('compression');

const getmyProduct = catchAsync(async (req, res) => {
    const { id } = pick(req.params, ["id"])
    const { limit, page,search } = req.query
    console.log(limit, page, req.query);
    const result = await services.getmyProduct(id, limit, page, search);

    if (result?.code === 200) {
        sendResponse(res, httpStatus.OK, result, null);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, result?.data, null);
    }
});

module.exports = getmyProduct;
