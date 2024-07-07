const express = require('express');
const auth = require('../../middlewares/auth');
const cartController = require('../../modules/cart/controllers');

const router = express.Router();

router.post('/add-to-cart', auth('manageUsers'), cartController.addToCart)
router.put('/update-cart-status/:cartId', auth('manageUsers'), cartController.updateCartStatus)
router.get('/get-my-cart', auth('manageUsers'), cartController.getMyCart)

router.put('/update-cart-item', auth("manageUsers"), cartController.updateCartItemController)

module.exports = router;
