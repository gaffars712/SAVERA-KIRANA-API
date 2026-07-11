const express = require('express');
const auth = require('../../middlewares/auth');
const { requireRole } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./settings.controller');
const validation = require('./settings.validation');
const { SUPER_ADMIN } = require('../../config/roles');

const router = express.Router();

router.get('/', auth('manageSettings'), requireRole(SUPER_ADMIN), controller.getAdminSettings);
router.patch(
  '/',
  auth('manageSettings'),
  requireRole(SUPER_ADMIN),
  validate(validation.update),
  controller.updateSettings
);

module.exports = router;
