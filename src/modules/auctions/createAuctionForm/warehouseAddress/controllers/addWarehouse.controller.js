const httpStatus = require("http-status");
const catchAsync = require("../../../../../utils/catchAsync");
const pick = require("../../../../../utils/pick");
const { sendResponse } = require("../../../../../utils/responseHandler");
const services = require("../services");



const addWarehouse = catchAsync(async (req, res) => {
  const userId = req?.user?.id;

  const {auctionId,serviceProviderId,deliverFrom,nameOfWarehouse,warehouseNumber,address,active} =
   await pick(req.body, ["auctionId","serviceProviderId","deliverFrom","nameOfWarehouse","warehouseNumber","address","active",]);

  const addResult = await services.addWarehouse({auctionId,serviceProviderId,deliverFrom,nameOfWarehouse,warehouseNumber,address,active,userId,});

  if (addResult?.code === 200) {
    sendResponse(res, httpStatus.OK, addResult?.data, null);
  } else if (addResult?.code === 400) {
    sendResponse(res, httpStatus.BAD_REQUEST, addResult?.data, null);
  } else {
    sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, addResult?.data, null);
  }
});


module.exports = addWarehouse;



