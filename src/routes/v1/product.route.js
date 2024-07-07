const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const  productControllers  = require('../../modules/products/controller');
const productValidation = require('../../modules/products/product.validation')


const router = express.Router();

router.get('/getAllProduct',  productControllers.getAllProductController);

router.get('/getProductById/:id',  productControllers.getProductByIdController);

router.get('/getmyProduct/:id', auth('manageUsers'), productControllers.getmyProduct);

module.exports = router;
