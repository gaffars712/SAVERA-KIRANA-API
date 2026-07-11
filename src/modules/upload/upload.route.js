const express = require('express');
const auth = require('../../middlewares/auth');
const { requireAdmin } = require('../../middlewares/auth');
const upload = require('../../middlewares/upload');
const controller = require('./upload.controller');

const router = express.Router();

router.use(auth(), requireAdmin);

router.post('/', upload.single('file'), controller.uploadOne);
router.post('/multi', upload.array('files', 8), controller.uploadMany);
router.post('/delete', controller.deleteAsset);

module.exports = router;
