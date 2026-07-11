const express = require('express');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { jwtStrategy } = require('./config/passport');

const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use(helmet());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(xss());
app.use(mongoSanitize());
app.use(compression());

const corsOptions = config.corsOrigins.length
  ? { origin: config.corsOrigins, credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

app.use('/v1', routes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'savera-kirana-api',
    version: '0.1.0',
    env: config.env,
  });
});

app.use((req, res, next) => next(new ApiError(httpStatus.NOT_FOUND, 'Not found')));
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
