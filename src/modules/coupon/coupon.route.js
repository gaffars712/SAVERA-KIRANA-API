const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./coupon.controller');
const validation = require('./coupon.validation');

const adminRouter = express.Router();
adminRouter.get('/', auth('manageCoupons'), validate(validation.list), controller.list);
adminRouter.post('/', auth('manageCoupons'), validate(validation.create), controller.create);
adminRouter.patch('/:id', auth('manageCoupons'), validate(validation.update), controller.update);
adminRouter.delete('/:id', auth('manageCoupons'), validate(validation.byId), controller.remove);

const customerRouter = express.Router();
customerRouter.post('/apply', auth('manageOwnCart'), validate(validation.apply), controller.apply);

module.exports = { adminRouter, customerRouter };
