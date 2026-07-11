const express = require('express');
const auth = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./admin.controller');
const validation = require('./admin.validation');
const { SUPER_ADMIN } = require('../../config/roles');

const router = express.Router();

// All routes are super-admin only
router.use(auth('manageAdmins'), requireRole(SUPER_ADMIN));

router.get('/', validate(validation.list), controller.list);
router.get('/:id', validate(validation.byId), controller.get);
router.post('/', validate(validation.create), controller.create);
router.patch('/:id', validate(validation.update), controller.update);
router.post('/:id/deactivate', validate(validation.byId), controller.deactivate);
router.post('/:id/activate', validate(validation.byId), controller.activate);

module.exports = router;
