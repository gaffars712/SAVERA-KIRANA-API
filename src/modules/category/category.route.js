const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./category.controller');
const validation = require('./category.validation');

const router = express.Router();

router.get('/', auth('manageCatalog'), validate(validation.list), controller.list);
router.get('/tree', auth('manageCatalog'), controller.tree);
router.get('/:id', auth('manageCatalog'), validate(validation.byId), controller.get);
router.post('/', auth('manageCatalog'), validate(validation.create), controller.create);
router.patch('/:id', auth('manageCatalog'), validate(validation.update), controller.update);
router.delete('/:id', auth('manageCatalog'), validate(validation.byId), controller.remove);

module.exports = router;
