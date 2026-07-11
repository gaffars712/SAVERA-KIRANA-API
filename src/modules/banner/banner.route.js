const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./banner.controller');
const validation = require('./banner.validation');

const router = express.Router();

router.get('/', auth('manageBanners'), validate(validation.list), controller.list);
router.get('/:id', auth('manageBanners'), validate(validation.byId), controller.get);
router.post('/', auth('manageBanners'), validate(validation.create), controller.create);
router.patch('/:id', auth('manageBanners'), validate(validation.update), controller.update);
router.delete('/:id', auth('manageBanners'), validate(validation.byId), controller.remove);

module.exports = router;
