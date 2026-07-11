const multer = require('multer');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

const IMAGE_MIME = /^image\/(jpeg|jpg|png|webp|gif|avif)$/;
const MAX_SIZE_MB = 8;

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!IMAGE_MIME.test(file.mimetype)) {
    return cb(new ApiError(httpStatus.BAD_REQUEST, 'Only image files are allowed'));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = upload;
module.exports.MAX_SIZE_MB = MAX_SIZE_MB;
