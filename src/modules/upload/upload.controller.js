const httpStatus = require('http-status');
const catchAsync = require('../../utils/catchAsync');
const ApiError = require('../../utils/ApiError');
const cloudinary = require('../../services/cloudinary.service');

const uploadOne = catchAsync(async (req, res) => {
  if (!req.file) throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  if (!cloudinary.isConfigured())
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Image hosting not configured');

  const folder = req.query.folder || 'misc';
  const result = await cloudinary.uploadBuffer(req.file.buffer, { folder });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
    },
  });
});

const uploadMany = catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0)
    throw new ApiError(httpStatus.BAD_REQUEST, 'No files uploaded');
  if (!cloudinary.isConfigured())
    throw new ApiError(httpStatus.SERVICE_UNAVAILABLE, 'Image hosting not configured');

  const folder = req.query.folder || 'misc';
  const results = await cloudinary.uploadMany(req.files, { folder });

  res.status(httpStatus.CREATED).json({
    success: true,
    data: results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      width: r.width,
      height: r.height,
      bytes: r.bytes,
      format: r.format,
    })),
  });
});

const deleteAsset = catchAsync(async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) throw new ApiError(httpStatus.BAD_REQUEST, 'publicId is required');
  const result = await cloudinary.deleteAsset(publicId);
  res.json({ success: true, data: result });
});

module.exports = { uploadOne, uploadMany, deleteAsset };
