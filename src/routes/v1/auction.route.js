const express = require("express");
const validate = require("../../middlewares/validate");
const auth = require("../../middlewares/auth");

// General Info
const auctionGeneralInfoController = require("../../modules/auctions/createAuctionForm/generalInformation/controllers");
const auctionGeneralInfoValidation = require("../../../src/modules/auctions/createAuctionForm/generalInformation/generalInformation.validation");

//warehouse
const warehouseValidation = require("../../modules/auctions/createAuctionForm/warehouseAddress/warehouseAddress.validation");
const warehouseController = require("../../modules/auctions/createAuctionForm/warehouseAddress/controllers");

// Time and payment information
const validation = require('../../modules/auctions/createAuctionForm/timeAndPaymentInfo/timeAndPaymentInfo.validation')
const TimePaymentController = require('../../modules/auctions/createAuctionForm/timeAndPaymentInfo/controllers')

//Auction
const auctionInfoController = require("../../modules/auctions/auctionInfo/controllers");
// const auctionGeneralInfoValidation = require("../../../src/modules/auctions/createAuctionForm/generalInformation/generalInformation.validation");


const router = express.Router();
//Ware house 
router.post("/add-warehouse", auth('manageUsers'), validate(warehouseValidation.addWarehouse), warehouseController.addWarehouse);

router.get('/get-warehouse/:id', auth('manageUsers'), validate(warehouseValidation.getWarehouse), warehouseController.getWarehouse);

router.put('/update-warehouse/:id', auth('manageUsers'), validate(warehouseValidation.updateWarehouse), warehouseController.updateStore);


// Generral information
router.post("/create-auction-general", auth('manageUsers'), validate(auctionGeneralInfoValidation.auctionInfoValidation), auctionGeneralInfoController.creategeneralInformation);

router.get('/get-auction-general/:id', validate(auctionGeneralInfoValidation.getAuctionInfoValidation), auth('manageUsers'), auctionGeneralInfoController.getGeneralInformation)

router.put('/update-auction-general/:id', auth('manageUsers'), validate(auctionGeneralInfoValidation.updateAuctionInfoValidation), auctionGeneralInfoController.updateGeneralInformation)

// Time and payment information
router.post('/add-time-payment-info', auth('manageUsers'), validate(validation.addTimeandpayment), TimePaymentController.TimeandPaymentInfo);

router.get('/get-time-payment-info/:id', auth('manageUsers'), validate(validation.getTimeandPayment), TimePaymentController.getTimeandPayment);

router.put('/update-time-payment-info/:id', auth('manageUsers'), validate(validation.UpdateTimeandpaymentInfoValidation), TimePaymentController.updateTimeandDate);

//Public auctions
router.get('/get-all-auction', auctionInfoController.getAllAution);

router.get('/get-auction/:id', auctionInfoController.getmyAuctionbyId);

router.get('/get-my-all-auction/:id', auth('manageUsers'), auctionInfoController.getmyallAuctionbyId);

module.exports = router;
