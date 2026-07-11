const express = require('express');
const auth = require('../../middlewares/auth');
const catchAsync = require('../../utils/catchAsync');
const service = require('./stats.service');

const router = express.Router();

router.get(
  '/dashboard',
  auth('viewReports'),
  catchAsync(async (req, res) => {
    res.json({ success: true, data: await service.dashboard() });
  })
);

module.exports = router;
