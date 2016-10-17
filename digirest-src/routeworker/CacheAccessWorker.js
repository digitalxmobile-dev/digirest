/**
 * This file is a worker for all cache operations
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'CacheAccessWorker';
var CacheService = require('../objectFactory/ObjectFactory').cacheService;


/**
 * the constructor
 * @param routeConfig
 * @constructor
 */
function CacheAccessWorker(routeConfig) {
  console.log(JSON.stringify(routeConfig));
}

/**
 * the invoke method
 * @param req
 * @param res
 */
CacheAccessWorker.prototype.invoke = function (req, res) {
  console.log(MODULE_NAME + ': received request');
  var outMessage = '<html><body><h1>Digirest cache</h1><table>';


  if (req.route.methods.get) {
    // GET /cache/:cachekey
    if (req.params.cachekey) {
      outMessage += '<tr><td<b>' + req.params.cachekey + '</b>: [' + JSON.stringify(_getCacheService().get(req.params.cachekey)) + ']</td></tr>';
    } else {
      // GET /cache
      var keys = _getCacheService().keys();
      for (var key in keys) {
        outMessage += '<tr><td><b>' + keys[key] + '</b>: [' + JSON.stringify(_getCacheService().get(keys[key])) + ']</td></tr>';
      }
    }
    outMessage += '</table>';
    outMessage += '<p>Hits ' + _getCacheService().hits() + '</p>';
    outMessage += '<p>Miss ' + _getCacheService().misses() + '</p>';
    outMessage += '</body></html>';
    res.send(outMessage);

  } else if (req.route.methods.delete) {
    // DELETE /cache
    // TODO token based delete for safety
    _getCacheService().clear();
    res.sendStatus(200);
  }

}

/**
 * private getter for the cache service
 * @returns {*}
 * @private
 */
function _getCacheService() {
  if (CacheService) {
    return CacheService;
  } else {
    return require('../objectFactory/ObjectFactory').cacheService;
  }
}


/** exports */
module.exports = CacheAccessWorker;