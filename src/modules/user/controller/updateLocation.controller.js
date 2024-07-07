const httpStatus = require('http-status');
const catchAsync = require('../../../utils/catchAsync');
const { sendResponse } = require('../../../utils/responseHandler');
const userService = require('../services/index');
const pick = require('../../../utils/pick');

const updateUserLocation = catchAsync(async (req, res) => {
    const { userLocation } = await pick(req.body, ["userLocation"]);
    const userId = req.user.id
  
    const user = await userService.updateUserLocation(userLocation, userId);
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

  module.exports = updateUserLocation