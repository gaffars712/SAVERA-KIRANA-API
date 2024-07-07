const express = require('express');
const validate = require('../../middlewares/validate');
const uservalidation = require('../../validations/user.validation');
const userController = require('../../modules/user/controller/index');
const auth = require("../../middlewares/auth")

const router = express.Router();

router.put('/update-profile', auth('manageUsers'),validate(uservalidation.updateProfile), userController.updateProfile);

router.put('/update-location', auth('manageUsers'), userController.updateUserLocation);

router.post('/update-phone-otp', auth('manageUsers'), userController.sendPhoneUpdateOTP);

router.put('/update-phone-number', auth('manageUsers'), userController.updatePhoneNumber);

// apis for admin

router.get('/get-all-user', auth('adminAccess'), userController.getUsers);

router.put('/update-user/:id', auth('adminAccess'), userController.updateUser);


module.exports = router;
