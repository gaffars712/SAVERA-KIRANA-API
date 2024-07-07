const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { sendResponse } = require('../utils/responseHandler');
const User = require('../models/user.model')

const getUsers = catchAsync(async (req, res) => {
    let options = req.body.options
    let filter = req.body.filter
    var result1 = {
      ...filter,
      active: true,
    };
    const result = await User.paginate(result1, options);
    try {
      if (result) {
        sendResponse(res, httpStatus.OK, result, null);
      }
    } catch (error) {
      sendResponse(res, httpStatus.BAD_REQUEST, null, 'cannot getting user');
    }
  });

module.exports = {
    getUsers
}