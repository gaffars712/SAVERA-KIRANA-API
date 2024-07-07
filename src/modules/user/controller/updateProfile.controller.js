const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { sendResponse } = require('../../../utils/responseHandler');
const userService = require('../services/index');
const pick = require('../../../utils/pick');

const updateProfile = catchAsync(async (req, res) => {
    const { name, email } = await pick(req.body, ["name", "email"]);
    const userId = req.user.id
  
    const user = await userService.updateProfile(name, email, userId);
    if (user.status) {
      sendResponse(res, httpStatus.OK, user, null);
    } else {
      if (user.code == 400) {
        sendResponse(res, httpStatus.BAD_REQUEST, null, user.msg);
      } else if (user.code == 500) {
        sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, null, user.msg);
      } else {
        sendResponse(res, httpStatus.BAD_REQUEST, null, user.msg);
      }
    }
  });

  module.exports = updateProfile