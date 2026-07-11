const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./deliveryZone.controller');
const validation = require('./deliveryZone.validation');

const adminRouter = express.Router();
adminRouter.get('/', auth('manageDeliveryZones'), controller.list);
adminRouter.post('/', auth('manageDeliveryZones'), validate(validation.create), controller.create);
adminRouter.patch('/:id', auth('manageDeliveryZones'), validate(validation.update), controller.update);
adminRouter.delete('/:id', auth('manageDeliveryZones'), validate(validation.byId), controller.remove);

const publicRouter = express.Router();
publicRouter.get('/serviceability', validate(validation.check), controller.check);

module.exports = { adminRouter, publicRouter };
