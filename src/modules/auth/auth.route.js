const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const controller = require('./auth.controller');
const validation = require('./auth.validation');

const router = express.Router();

/* Email OTP flow (primary customer login) */
router.post('/email/request', validate(validation.requestEmailOtp), controller.requestEmailOtp);
router.post('/email/verify', validate(validation.verifyEmailOtp), controller.verifyEmailOtp);

/* Phone OTP flow (legacy, kept for compat) */
router.post('/otp/request', validate(validation.requestOtp), controller.requestOtp);
router.post('/otp/verify', validate(validation.verifyOtp), controller.verifyOtp);

/* Firebase Phone Auth (optional — requires Blaze plan) */
router.post('/firebase/phone', validate(validation.firebasePhone), controller.firebasePhone);

/* Profile — update name / add phone at checkout */
router.patch('/me', auth('manageOwnProfile'), validate(validation.updateProfile), controller.updateProfile);

/* Admin login */
router.post('/admin/login', validate(validation.adminLogin), controller.adminLogin);

/* Common */
router.post('/refresh', validate(validation.refresh), controller.refresh);
router.get('/me', auth(), controller.me);

module.exports = router;
