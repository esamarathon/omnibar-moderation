import pino from 'pino';
import settings from './settings';

const logger = pino({
  name: 'Omnibar-moderation',
  level: 'debug',
  prettyPrint: {
    levelFirst: true,
    forceColor: true
  }
});

if (settings.log.level) {
  logger.level = settings.log.level;
  logger.info('Setting loglevel to', logger.level);
}

// Disable stdout for testing
if (process.env.NODE_ENV === 'test') {
  logger.level = 'silent';
}

export default logger;
