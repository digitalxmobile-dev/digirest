/**
 * This file is a worker for a simple (static) query
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SimpleSelectRouteWorker';
//var runQueryService = require('../dataservice/
var REPLACE_HOLDER = '$$REPLACE$$';
var AdvancedString = require('string');
var query;
var collection;
var cache = false;
var cachetime = 0;
var configurationsPool = {};

/**
 * the constructor
 * @param routeConfig
 * @constructor
 */
function SimpleSelectRouteWorker(routeConfig) {
  console.log(JSON.stringify(routeConfig));
  this.query = routeConfig['conf.query'];
  this.collection = routeConfig['conf.collection'];
  if (routeConfig['conf.cache']) {
    this.cache = routeConfig['conf.cache'];
    this.cachetime = routeConfig['conf.cachetime'];
  } else if (routeConfig['conf.cachetime']) {
    this.cache = true;
    this.cachetime = routeConfig['conf.cachetime'];
  } else {
    this.cache = false;
  }

  query = this.query;
  collection = this.collection;

  var configurationKey = routeConfig.method + '/' + routeConfig.pattern;
  configurationsPool[configurationKey] = this;
}

/**
 * the invoke method
 * @param req
 * @param res
 */
SimpleSelectRouteWorker.prototype.invoke = function (req, res) {
  console.log(MODULE_NAME + ': received request');

  //get the conf from the pool
  var self = __getObjectByRequest(configurationsPool, req);

  // replace (eventually) the placeholders and execute the query
  _replacePlaceholder(self, res);

}

/**
 * replace eventually the placeholders and execute query
 * @param self
 * @param res
 * @param idObj
 * @private
 */
function _replacePlaceholder(self, res) {

  /** prepare the function to invoke at the end of operation */
  var functionComplete = function (error, value) {

    /** if is a callback from a placeholder invokation, replace */
    if (value && !error && self.query.indexOf(REPLACE_HOLDER) != -1) {
      var stringObj = AdvancedString(self.query);
      stringObj = stringObj.replaceAll(REPLACE_HOLDER, value);
      self.query = stringObj.toString();
    }

    // create the query
    var queryObj = JSON.parse(self.query);

    //get the select woker
    var _selectWorker = require('./AbstractSelectWorker');

    // execute select
    _selectWorker._runSelect(self, queryObj, res);

  };

  /** replace and eval the placeholders */
  if (self.query.indexOf('$$') != -1) {
    var stringSplits = self.query.split('$$');
    /*   {"fieldname" : "$$placeholder$$" }
     *   splits=['{"fieldname" : "','placeholder','"}']
     */
    if (stringSplits && stringSplits.length == 3) {
      self.query = stringSplits[0] + '$$REPLACE$$' + stringSplits[2];
      var placeHolder = stringSplits[1].split('.');
      // get the module
      var module = require('../objectfactory/ObjectFactory')[placeHolder[0]];
      // invoke the function
      module[placeHolder[1]](functionComplete)

    }
  } else {
    functionComplete(null, null);
  }
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


/** exports */
module.exports = SimpleSelectRouteWorker;