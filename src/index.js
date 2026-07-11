/* eslint-disable no-console */
const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;

async function start() {
  await mongoose.connect(config.mongoose.url, config.mongoose.options);
  logger.info('Connected to MongoDB');

  // Ensure Settings singleton exists on first boot
  const { Settings } = require('./models');
  await Settings.getSingleton();

  server = app.listen(config.port, () => {
    logger.info(`Savera Kirana API listening on :${config.port}  (${config.env})`);
  });
}

start().catch((err) => {
  logger.error('Startup failed: ' + (err.message || err));
  process.exit(1);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (e) => {
  logger.error(e);
  exitHandler();
});
process.on('unhandledRejection', (e) => {
  logger.error(e);
  exitHandler();
});
process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) server.close();
});
