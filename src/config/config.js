const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').default('development'),
    PORT: Joi.number().default(4000),
    REMOTE_BASE_URL: Joi.string().default('http://localhost:4000'),

    MONGODB_URL: Joi.string().required().description('Mongo DB url'),

    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(60),
    JWT_REFRESH_EXPIRATION_MINUTES: Joi.number().default(43200), // 30 days
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number().default(10),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number().default(10),

    // Super admin seeder
    SUPER_ADMIN_NAME: Joi.string().default('Super Admin'),
    SUPER_ADMIN_EMAIL: Joi.string().email().default('admin@saverakirana.in'),
    SUPER_ADMIN_PASSWORD: Joi.string().min(6).default('ChangeMe@123'),
    SUPER_ADMIN_PHONE: Joi.string().default('+919999999999'),

    // Twilio (optional in dev)
    TWILIO_ACCOUNT_SID: Joi.string().allow('').default(''),
    TWILIO_AUTH_TOKEN: Joi.string().allow('').default(''),
    TWILIO_MESSAGING_SERVICE_SID: Joi.string().allow('').default(''),
    TWILIO_FROM: Joi.string().allow('').default(''),

    // Razorpay (optional in dev)
    RAZORPAY_KEY_ID: Joi.string().allow('').default(''),
    RAZORPAY_KEY_SECRET: Joi.string().allow('').default(''),
    RAZORPAY_WEBHOOK_SECRET: Joi.string().allow('').default(''),

    // Cloudinary (optional in dev — required for production image uploads)
    CLOUDINARY_CLOUD_NAME: Joi.string().allow('').default(''),
    CLOUDINARY_API_KEY: Joi.string().allow('').default(''),
    CLOUDINARY_API_SECRET: Joi.string().allow('').default(''),
    CLOUDINARY_UPLOAD_FOLDER: Joi.string().default('savera-kirana'),

    // AWS S3 (optional in dev)
    AWS_REGION: Joi.string().allow('').default('ap-south-1'),
    AWS_ACCESS_KEY_ID: Joi.string().allow('').default(''),
    AWS_SECRET_ACCESS_KEY: Joi.string().allow('').default(''),
    AWS_S3_BUCKET: Joi.string().allow('').default(''),

    // Firebase Phone Auth (optional in dev; required for production customer login)
    FIREBASE_SERVICE_ACCOUNT_B64: Joi.string().allow('').default(''),

    // Google (optional)
    CLIENT_ID: Joi.string().allow('').default(''),
    CLIENT_SECRET: Joi.string().allow('').default(''),

    // CORS
    CORS_ORIGINS: Joi.string().allow('').default(''),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const corsOrigins = envVars.CORS_ORIGINS
  ? envVars.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : [];

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  REMOTE_BASE_URL: envVars.REMOTE_BASE_URL,
  corsOrigins,
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {},
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationMinutes: envVars.JWT_REFRESH_EXPIRATION_MINUTES,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  },
  seed: {
    superAdmin: {
      name: envVars.SUPER_ADMIN_NAME,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: envVars.SUPER_ADMIN_PASSWORD,
      phone: envVars.SUPER_ADMIN_PHONE,
    },
  },
  twilio: {
    accountSid: envVars.TWILIO_ACCOUNT_SID,
    authToken: envVars.TWILIO_AUTH_TOKEN,
    messagingServiceSid: envVars.TWILIO_MESSAGING_SERVICE_SID,
    from: envVars.TWILIO_FROM,
  },
  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
    webhookSecret: envVars.RAZORPAY_WEBHOOK_SECRET,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
    uploadFolder: envVars.CLOUDINARY_UPLOAD_FOLDER,
  },
  aws: {
    region: envVars.AWS_REGION,
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    s3Bucket: envVars.AWS_S3_BUCKET,
  },
  google: {
    clientId: envVars.CLIENT_ID,
    clientSecret: envVars.CLIENT_SECRET,
  },
  firebase: {
    serviceAccountB64: envVars.FIREBASE_SERVICE_ACCOUNT_B64,
  },
};
