/**
 * Middleware for request tracing on loki
 * Author: Aureliano
 * @Deprecated
 * TODO
 * FIXME : is this used?
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'LocalTracingMiddleware';
var DbService = require('../objectfactory/ObjectFactory').localDbService;

// the middleware function
module.exports = function () {

  return function (req, res, next) {

    //parse obj
    var dbObject = {}

    //http method
    dbObject.method = req.method;

    //url invoked (only postfix)
    dbObject.originalUrl = req.originalUrl;

    ////raw headers array NULL IN AZURE
    //parseObj.rawHeaders = JSON.stringify(req.rawHeaders);

    //start time
    dbObject.startTime = req._startTime.toString();

    // req body
    dbObject.body = {};
    if (req.body) {
      var keys = Object.keys(req.body);
      for (var iterator in keys) {
        var key = keys[iterator];
        dbObject.body[key] = req.body[key];
      }
    }
    dbObject.body = JSON.stringify(dbObject.body);

    // req query
    dbObject.query = {}
    if (req.query) {
      keys = Object.keys(req.query);
      for (var iterator in keys) {
        var key = keys[iterator];
        dbObject.query[key] = req.query[key];
      }
    }
    dbObject.query = JSON.stringify(dbObject.query);

    dbObject.unit = process.env.UNITCODE;
    dbObject.env = process.env.ENV;


    //console.log('TRACING:::[%s]:[%s]:[%s]:[%s]:::::',parseObj.startTime,parseObj.method,parseObj.originalUrl,parseObj.rawHeaders);
    //console.log('TRACING REQ:::[%s]:[%s]::::::',parseObj.body, parseObj.query);

    // parse key validation
    for (var key in dbObject) {
      if (typeof key !== 'string' || typeof dbObject[key] !== 'string') {
        console.log('PARSE mabybe cannot log ' + key + dbObject[key]);
      }
    }


    // invoke parse
    try {
      var db = _getDbService();
      db.atomicWrite("request", dbObject);
    }
    catch (e) {
      console.log(MODULE_NAME + ": error invoking LOKI " + JSON.stringify(e) + " " + e.message + " " + JSON.stringify(dbObject));
    }
    finally {
      // go to next ANYWAY
      next();
    }

  }

};

/**
 * getter for the parse service
 * @returns {*}
 * @private
 */
function _getDbService() {
  if (!DbService) {
    DbService = require('../objectfactory/ObjectFactory').localDbService;
  }
  return DbService;
}