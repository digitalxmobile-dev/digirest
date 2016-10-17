/**
 * This middleware ask users to be auth against application
 * Author: Aureliano
 */

"use strict";

/** global requires and vars */
const MODULE_NAME = 'SecurityJwtMiddleware';
var SecurityService = require('../objectfactory/ObjectFactory').securityService;
var isDev = 'notdefined';

module.exports = function _ApplicationFilter(req, res, next) {

  if (isDev === 'notdefined') {
    isDev = process.env.ENV == 'development' && process.env.SKIP_AUTH == 'true';
  }

  // check for debug version
  if (isDev) {
    next();
  } else {

    // check header or url parameters or post parameters for token
    let token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

      // verifies secret and checks exp
      _getSecurityService().verifyToken(token,
        function (err, decoded) {
          if (err) {
            return res.status(403).send({
              success: false,
              message: 'Failed to authenticate token.'
            });
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            next();
          }
        });

    } else {

      // if there is no token
      // return an error
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }
  }
}

/**
 * security service getter
 * @returns {*}
 * @private
 */
function _getSecurityService() {
  if (!SecurityService) {
    SecurityService = require('../objectfactory/ObjectFactory').securityService;
  }
  return SecurityService;
}

