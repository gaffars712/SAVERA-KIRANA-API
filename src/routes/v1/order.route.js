const express = require('express');
const auth = require('../../middlewares/auth');
const cartController = require('../../modules/orders/controllers');
const validation = require('../../modules/orders/order.validation');
const validate = require('../../middlewares/validate');
const router = express.Router();

router.post('/create-order', auth('manageUsers'), validate(validation.orderValidation), cartController.createOrder)
// router.put('/update-cart-status/:cartId', auth('manageUsers'), cartController.updateCartStatus)
router.get('/get-my-order', auth('manageUsers'), cartController.getMyOrder)
// router.get('/get-my-cart', auth('manageUsers'), cartController.getMyCart)

module.exports = router;
