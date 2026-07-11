const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./order.controller');
const validation = require('./order.validation');

/* ─── Customer ─── */
const customerRouter = express.Router();
customerRouter.use(auth('placeOrder'));

customerRouter.get('/', validate(validation.listMine), controller.listMine);
customerRouter.get('/:id', validate(validation.byId), controller.getMine);
customerRouter.post('/', validate(validation.create), controller.create);
customerRouter.post('/verify-payment', validate(validation.verify), controller.verifyPayment);
customerRouter.post('/:id/cancel', validate(validation.cancelMine), controller.cancelMine);

/* ─── Admin ─── */
const adminRouter = express.Router();
adminRouter.use(auth('manageOrders'));

adminRouter.get('/', validate(validation.adminList), controller.adminList);
adminRouter.get('/:id', validate(validation.byId), controller.adminGet);
adminRouter.post('/:id/status', validate(validation.transition), controller.adminTransition);
adminRouter.post('/:id/assign-rider', validate(validation.assign), controller.adminAssignRider);
adminRouter.post('/:id/preparing', validate(validation.byId), controller.startPreparing);
adminRouter.post('/:id/ready', validate(validation.byId), controller.markReady);
adminRouter.post('/:id/verify-pickup', validate(validation.verifyPickup), controller.verifyPickup);

module.exports = { customerRouter, adminRouter };
