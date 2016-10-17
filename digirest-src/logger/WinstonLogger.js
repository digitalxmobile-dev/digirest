
/**
 * @Deprecated
 * @TODO: replace with a Logger global instance method
 * @FIXME
 * This is a logger based on winston
 * Author: Aureliano
 */
var MODULE_NAME = 'WinstonLogger';
var winston = require('winston');
var mainLogger;
var __enablewinston = false;

/* FIXME
 this class is almost NOT WORKING
 */

/**
 * return the mainLogger - private method
 * @returns {*}
 * @private
 */
function _getLogger() {
  if (__enablewinston) {
    if (mainLogger) {
      return mainLogger;
    } else {
      mainLogger = new (winston.Logger)({
        transports: [
          new (winston.transports.File)({
            name: 'info-file',
            filename: 'digirest-info.log',
            level: 'info'
          }),
          new (winston.transports.File)({
            name: 'error-file',
            filename: 'digirest-error.log',
            level: 'error'
          })
        ],
        exceptionHandlers: [
          new winston.transports.File({filename: 'exceptions.log'})
        ]
      });
      return mainLogger;
    }
  }
}

/**
 * log at info level
 * @param message
 * @private
 */
function _info(message) {
  console.log(message);
  var logger = _getLogger();
  if (logger) {
    logger.info(message);
  }
}

/**
 * log at error level
 * @param message
 * @param error
 * @private
 */
function _error(message, error) {
  if (error) {
    message += ' ' + JSON.stringify(error);
  }
  console.log(message);
  var logger = _getLogger();
  if (logger) {
    logger.error(message);
  }
}

/** exports */
exports.info = _info;
exports.error = _error;