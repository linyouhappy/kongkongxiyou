var logger = require('../lib/logger').getLogger('log', __filename, process.pid);

process.env.LOGGER_LINE = true;
// process.env.RAW_MESSAGE = true;
logger.info('test1');
logger.warn('test2');
logger.error('test3');