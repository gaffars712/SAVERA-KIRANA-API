const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const  ratingController  = require('../../modules/ratings/controller');
const productValidation = require('../../modules/ratings/rating.validation')


const router = express.Router();

router.post('/add-update-rating', auth("manageUsers"),  ratingController.addRating);



module.exports = router;
