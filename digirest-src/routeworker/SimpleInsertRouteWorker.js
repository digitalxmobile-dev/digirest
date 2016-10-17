/**
 * Simple insert worker
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SimpleInsertRouteWoker';
var collection;
var configurationsPool = {};

/**
 * Constructor
 * @param routeConfig
 * @constructor
 */
function SimpleInsertRouteWoker(routeConfig) {
  console.log(JSON.stringify(routeConfig));
  this.collection = routeConfig['conf.collection'];
  var configurationKey = routeConfig.method + '/' + routeConfig.pattern;
  configurationsPool[configurationKey] = this;
}

/**
 * the invoke method
 * @param req
 * @param res
 */
SimpleInsertRouteWoker.prototype.invoke = function (req, res) {

  console.log('POST req ' + JSON.stringify(req.body));

  //get the conf from the pool
  var self = __getObjectByRequest(configurationsPool, req);

  //get the insert woker
  var _selectWorker = require('./AbstractInsertWorker');

  // execute select
  _selectWorker._runInsert(self, req, res);

}

/**
 * get the configuration
 * @param configurationPool
 * @param req
 * @returns {*}
 * @private
 */
function __getObjectByRequest(configurationPool, req) {
  var method;
  if (req.route.methods.post)method = 'POST';
  else if (req.route.methods.get)method = 'GET';
  else if (req.route.methods.delete)method = 'DELETE';
  else if (req.route.methods.trace)method = 'TRACE';
  else if (req.route.methods.put)method = 'PUT';
  else if (req.route.methods.options)method = 'OPTIONS';
  else if (req.route.methods.head)method = 'HEAD';
  var key = method + '/' + req.route.path;
  return configurationPool[key];
}

/** Exports */
module.exports = SimpleInsertRouteWoker;