/**
 * Created by Aureliano on 14/03/2016.
 * Middleware for breaking the express chain if 304 not modified
 *
 *
 * @discover usage
 */


'use strict';

/** global requires and vars */
const MODULE_NAME = 'NotModifiedBreakerMiddleware';

// the middleware function
module.exports = function () {

  return function (req, res, next) {

    if (res.headersSent && res.statusCode == 403) {
      console.log(MODULE_NAME + ' 403 break middleware chain');
      try {
        res.send();
        res.end();
      } catch (ex) {
        // DO NOTHING
      }
    } else {
      next();
    }
  }
};

