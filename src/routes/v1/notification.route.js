const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const notificationConroller = require('../../modules/notifications/controller');


const router = express.Router();

router.get('/get-notifications/:userId', auth('manageUsers'), notificationConroller.getNofitifation);
router.put('/update-notifications/:userId', auth('manageUsers'), notificationConroller.updateNotification);
router.delete('/delete-notifications/:userId', auth('manageUsers'), notificationConroller.deleteNotification);

module.exports = router;
