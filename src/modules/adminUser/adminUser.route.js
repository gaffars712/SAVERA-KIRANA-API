const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./adminUser.controller');
const validation = require('./adminUser.validation');

const router = express.Router();

// Any admin with viewReports can browse customers; deactivate/activate is
// gated by manageAdmins so store managers can look but not lock accounts.
router.get('/', auth('viewReports'), validate(validation.list), controller.list);
router.get('/:id', auth('viewReports'), validate(validation.byId), controller.get);
router.post('/:id/deactivate', auth('manageAdmins'), validate(validation.byId), controller.deactivate);
router.post('/:id/activate', auth('manageAdmins'), validate(validation.byId), controller.activate);

module.exports = router;
