TemplateWorker.js
/**
 * USE THIS AS A TEMPLATE
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
var query;
var collection;
var parameters;
var cache;
var cachetime;
var configurationsPool = {};

/**
 * Constructor
 * @param routeConfig
 * @constructor
 */
function __TemplateWorker(routeConfig) {
  console.log(JSON.stringify(routeConfig));
  this.query = routeConfig['conf.query'];
  this.collection = routeConfig['conf.collection'];
  this.parameters = routeConfig['conf.parameters'].split(',');
  if (routeConfig['conf.cache']) {
    this.cache = routeConfig['conf.cache'];
    this.cachetime = routeConfig['conf.cachetime'];
  } else {
    this.cache = false;
  }
  var configurationKey = routeConfig.method + '/' + routeConfig.pattern;
  configurationsPool[configurationKey] = this;
}

/**
 * the invoke method
 * @param req
 * @param res
 */
__TemplateWorker.prototype.invoke = function (req, res) {

  //get the conf from the pool
  var self = __getObjectByRequest(configurationsPool, req);

  //EXECUTE
  //res.send(data)
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
module.exports = __TemplateWorker;