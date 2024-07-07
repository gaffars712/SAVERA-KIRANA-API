const dotenv = require('dotenv');
const path = require('path');
const Joi = require('joi');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    CLIENT_ID: Joi.string().required(),
    CLIENT_SECRET: Joi.string().required(),
    CLIENT_IDFACEBOOK: Joi.string().required(),
    CLIENT_SECRETFACEBOOK: Joi.string().required(),
    REMOTE_BASE_URL: Joi.string().required(),
    MONGODB_URL: Joi.string().required().description('Mongo DB url'),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(60).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_MINUTES: Joi.number().default(60).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),

  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  REMOTE_BASE_URL:envVars.REMOTE_BASE_URL,
  googleAuth: {
    CLIENT_ID: envVars.CLIENT_ID,
    CLIENT_SECRET: envVars.CLIENT_SECRET,
    REDIRECT_URI: envVars.REMOTE_BASE_URL
  },
  facebookAuth: {
    CLIENT_ID: envVars.CLIENT_IDFACEBOOK,
    CLIENT_SECRET: envVars.CLIENT_SECRETFACEBOOK,
    REDIRECT_URI: envVars.REMOTE_BACKEND_API_URL
  },
  mongoose: {
    url: envVars.MONGODB_URL + (envVars.NODE_ENV === 'test' ? '-test' : ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationMinutes: envVars.JWT_REFRESH_EXPIRATION_MINUTES,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_PASSWORD_EXPIRATION_MINUTES,
    verifyEmailExpirationMinutes: envVars.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES,
  }
};
