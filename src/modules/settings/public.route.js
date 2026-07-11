const express = require('express');
const controller = require('./settings.controller');

const router = express.Router();

router.get('/fulfillment', controller.getPublicFulfillment);

module.exports = router;
