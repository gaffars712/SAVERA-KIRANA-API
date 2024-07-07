const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { sendResponse } = require('../../../utils/responseHandler');
const services = require('../services');
const pick = require('../../../utils/pick');

const getAllProductsController = catchAsync(async (req, res) => {

    const { page, limit, filter, search, sort } = pick(req.query, ['page', 'limit', 'filter', 'search', 'sort']);
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    let filters = {};
    if (filter) {
        try {
            filters = JSON.parse(filter);
        } catch (error) {
            return sendResponse(res, httpStatus.BAD_REQUEST, null, 'Invalid filter format');
        }
    }

    let searchCriteria = {};
    if (search) {
        try {
            searchCriteria = JSON.parse(search);
        } catch (error) {
            return sendResponse(res, httpStatus.BAD_REQUEST, null, 'Invalid search format');
        }
    }

    let sortCriteria = {};
    if (sort) {
        try {
            sortCriteria = JSON.parse(sort);
        } catch (error) {
            return sendResponse(res, httpStatus.BAD_REQUEST, null, 'Invalid sort format');
        }
    }

    const result = await services.getAllProductService(filters, searchCriteria, pageNum, limitNum, sortCriteria);

    if (result?.code === 200) {
        sendResponse(res, httpStatus.OK, result?.data, null);
    } else {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, result?.data, null);
    }
});

module.exports = getAllProductsController;
