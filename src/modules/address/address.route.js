const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./address.controller');
const validation = require('./address.validation');

const router = express.Router();
router.use(auth('manageOwnProfile'));

router.get('/', controller.list);
router.get('/:id', validate(validation.byId), controller.get);
router.post('/', validate(validation.create), controller.create);
router.patch('/:id', validate(validation.update), controller.update);
router.delete('/:id', validate(validation.byId), controller.remove);
router.post('/:id/default', validate(validation.byId), controller.setDefault);

module.exports = router;
