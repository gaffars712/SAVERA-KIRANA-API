const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./cart.controller');
const validation = require('./cart.validation');

const router = express.Router();
router.use(auth('manageOwnCart'));

router.get('/', validate(validation.list), controller.getMine);
router.post('/items', validate(validation.add), controller.add);
router.patch('/items', validate(validation.update), controller.update);
router.delete('/items', validate(validation.remove), controller.removeItem);
router.post('/clear', controller.clear);
router.post('/coupon/clear', controller.clearCoupon);

module.exports = router;
