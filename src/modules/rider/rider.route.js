const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./rider.controller');
const validation = require('./rider.validation');

const router = express.Router();
router.use(auth('manageRiders'));

router.get('/', validate(validation.list), controller.list);
router.get('/:id', validate(validation.byId), controller.get);
router.post('/', validate(validation.create), controller.create);
router.patch('/:id', validate(validation.update), controller.update);
router.delete('/:id', validate(validation.byId), controller.remove);
router.post('/:id/status', validate(validation.setStatus), controller.setStatus);

module.exports = router;
