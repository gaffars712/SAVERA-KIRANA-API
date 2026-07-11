const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const controller = require('./auth.controller');
const validation = require('./auth.validation');

const router = express.Router();

/* Customer OTP flow */
router.post('/otp/request', validate(validation.requestOtp), controller.requestOtp);
router.post('/otp/verify', validate(validation.verifyOtp), controller.verifyOtp);

/* Admin login */
router.post('/admin/login', validate(validation.adminLogin), controller.adminLogin);

/* Common */
router.post('/refresh', validate(validation.refresh), controller.refresh);
router.get('/me', auth(), controller.me);

module.exports = router;
