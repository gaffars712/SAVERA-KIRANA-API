const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const config = require('../config/config');
const logger = require('../config/logger');

let configured = false;

const ensureConfigured = () => {
  if (configured) return true;
  const { cloudName, apiKey, apiSecret } = config.cloudinary;
  if (!cloudName || !apiKey || !apiSecret) {
    return false;
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  configured = true;
  return true;
};

const uploadBuffer = (buffer, { folder = '', publicId, resourceType = 'image', tags = [] } = {}) =>
  new Promise((resolve, reject) => {
    if (!ensureConfigured()) {
      return reject(new Error('Cloudinary not configured — set CLOUDINARY_* env vars'));
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: [config.cloudinary.uploadFolder, folder].filter(Boolean).join('/'),
        public_id: publicId,
        resource_type: resourceType,
        tags,
        overwrite: true,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

const uploadMany = (files, opts = {}) => Promise.all(files.map((f) => uploadBuffer(f.buffer, opts)));

const deleteAsset = async (publicId) => {
  if (!ensureConfigured() || !publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (e) {
    logger.warn(`Cloudinary delete failed for ${publicId}: ${e.message}`);
    return null;
  }
};

/** Build an optimized delivery URL with width/height/quality/format transformations. */
const buildDeliveryUrl = (publicId, { width, height, crop = 'fill', quality = 'auto', format = 'auto' } = {}) => {
  if (!ensureConfigured() || !publicId) return null;
  const t = [];
  if (width) t.push(`w_${width}`);
  if (height) t.push(`h_${height}`);
  if (crop) t.push(`c_${crop}`);
  t.push(`q_${quality}`, `f_${format}`);
  return cloudinary.url(publicId, { transformation: [{ raw_transformation: t.join(',') }], secure: true });
};

const isConfigured = () => ensureConfigured();

module.exports = { uploadBuffer, uploadMany, deleteAsset, buildDeliveryUrl, isConfigured };
