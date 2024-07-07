const express = require('express');
const validate = require('../../middlewares/validate');
const ServiceProviderValidation = require('../../modules/serviceProvider/serviceProviderCreation/serviceProvider.validation');
const ServiceProviderCreationController = require('../../modules/serviceProvider/serviceProviderCreation/controller');
const StoreValidation =require("../../modules/serviceProvider/storeDetails/storeDetail.validation")
const StoreCreationController =require("../../modules/serviceProvider/storeDetails/controllers")
const auth = require('../../middlewares/auth');
const  addBankDetailsValidation  = require('../../modules/serviceProvider/bankDetails/bankDetail.validation');
const addBankDetailsController  = require('../../modules/serviceProvider/bankDetails/controllers');
const getServiceProviderController = require('../../modules/serviceProvider/serviceProviderCreation/controller/index');
const getBankDetailsController = require('../../modules/serviceProvider/bankDetails/controllers/index');
const adminServiceproviderController = require('../../modules/serviceProvider/detailsForAdmin/controller')
const router = express.Router();

router.post('/creation', auth('manageUsers'),validate(ServiceProviderValidation.addServiceProvider), ServiceProviderCreationController.addServiceProvider);

router.get('/get-service-provider', auth('manageUsers'), getServiceProviderController.getServiceProviderController);

router.post('/add-bank-details', auth('manageUsers'), validate(addBankDetailsValidation.addBankDetailsValidation), addBankDetailsController.addBankDetailsController)

router.get('/get-bank-details', auth('manageUsers'), getBankDetailsController.getBankDetailsController)

router.post('/add-store', auth('manageUsers'), validate(StoreValidation.addStore), StoreCreationController.addStore);

router.get('/get-store', auth('manageUsers'),  StoreCreationController.getMyStore);

router.get('/get-all-store',  StoreCreationController.getAllStore);

router.put('/update-store/:id', auth('manageUsers'),StoreCreationController.updateStore);

router.put('/update-service-provider/:id', auth('manageUsers'),validate(ServiceProviderValidation.addServiceProvider) ,ServiceProviderCreationController.updateServiceProviderController)

router.put('/update-bank-details/:id', auth('manageUsers'),validate(addBankDetailsValidation.addBankDetailsValidation) , addBankDetailsController.updateBankDetailsController)



// apis for admin

router.get('/get-all-service-providers', auth('adminAccess'), adminServiceproviderController.admingetServiceProvider)

router.get('/get-single-service-provider/:id', auth('adminAccess'), adminServiceproviderController.admingetServiceProviderController)

router.get('/update-single-service-provider/:id', auth('adminAccess'), adminServiceproviderController.adminUpdateServiceProvider)

router.put('/update-bankdetails-of-service-provider/:id', auth('adminAccess'), adminServiceproviderController.adminupdateBankDetails)
router.put('/update-storedetails-of-service-provider/:id', auth('adminAccess'), adminServiceproviderController.adminupdateStoreDetails)

module.exports = router;
