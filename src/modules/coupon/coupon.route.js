const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const controller = require('./coupon.controller');
const validation = require('./coupon.validation');

const adminRouter = express.Router();
adminRouter.get('/', auth('manageCoupons'), validate(validation.list), controller.list);
adminRouter.post('/', auth('manageCoupons'), validate(validation.create), controller.create);
adminRouter.patch('/:id', auth('manageCoupons'), validate(validation.update), controller.update);
adminRouter.delete('/:id', auth('manageCoupons'), validate(validation.byId), controller.remove);

const customerRouter = express.Router();
customerRouter.post('/apply', auth('manageOwnCart'), validate(validation.apply), controller.apply);

/** Public: list active coupons for customer offers page */
const publicRouter = express.Router();
publicRouter.get('/', async (req, res, next) => {
  try {
    const { Coupon } = require('../../models');
    const now = new Date();
    const list = await Coupon.find({
      isActive: true,
      $and: [
        { $or: [{ validFrom: { $exists: false } }, { validFrom: null }, { validFrom: { $lte: now } }] },
        { $or: [{ validTo: { $exists: false } }, { validTo: null }, { validTo: { $gte: now } }] },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('code title subtitle type value cap minCart validTo');
    res.json({ success: true, data: list });
  } catch (e) {
    next(e);
  }
});

module.exports = { adminRouter, customerRouter, publicRouter };
