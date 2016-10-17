/**
 * Middleware for getting binary in rawData
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'BinaryParserMiddleware';

// the middleware function
module.exports = function () {

  return function (req, res, next) {
    if (req.headers['content-type']) {
      //if present, is not binary, so skip this
      next();
    } else {
      var data = new Buffer('');
      req.on('data', function (chunk) {
        data = Buffer.concat([data, chunk]);
      });
      req.on('end', function () {
        req.rawBody = data;
        next();
      });
    }
  }
};

