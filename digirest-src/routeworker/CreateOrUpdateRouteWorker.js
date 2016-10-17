/**
 * try to update, else insert route worker
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'CreateOrUpdateRouteWorker';
var RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var configurationsPool = {};

/**
 * Constructor
 * @param routeConfig
 * @constructor
 */
function CreateOrUpdateRouteWorker(routeConfig) {
  console.log(JSON.stringify(routeConfig));
  this.collection = routeConfig['conf.collection'];
  this.qualification = routeConfig['conf.qualification'].split(',');
  var configurationKey = routeConfig.method + '/' + routeConfig.pattern;
  configurationsPool[configurationKey] = this;
}

/**
 * the invoke method
 * @param req
 * @param res
 */
CreateOrUpdateRouteWorker.prototype.invoke = function (req, res) {

  //get the conf from the pool
  var self = __getObjectByRequest(configurationsPool, req);

  //create the needed objects
  var objRequested = req.body;
  var objQualification = {};

  //populate qualifications
  for (var i = 0; i < self.qualification.length; i++) {
    var fieldName = self.qualification[i];
    objQualification[fieldName] = objRequested[fieldName];
  }
  console.log(MODULE_NAME + ": qualification [" + JSON.stringify(objQualification) + ']');

  // try the update
  _getObjectService().updateObject(
    objQualification,
    self.collection,
    objRequested,
    null,
    function onComplete(error, obj) {
      if (obj && obj.value) {
        //console.log('UPDATE OK ' + JSON.stringify(obj));
        res.status(200);
        res.send(JSON.stringify(obj.value));
      } else {
        // if fail, insert
        _getRunQueryService().runInsert(
          self.collection,
          objRequested,
          function onInsert(error, insertRes) {
            if (insertRes) {
              //console.log('INSERT OK ' +JSON.stringify(insertRes));
              if (insertRes.result.ok === 1) {
                res.status(201);
                res.send(JSON.stringify(insertRes.ops));
              } else {
                res.status(409);
                res.send;
              }
            } else {
              res.status(500);
              res.send(error);
            }
          });
      }
    });
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

/**
 * return the run queryservice
 * @returns {*}
 * @private
 */
function _getRunQueryService() {
  if (!RunQueryService) {
    RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
  } else {
    return RunQueryService;
  }
}

/**
 * return the run queryservice
 * @returns {*}
 * @private
 */
function _getObjectService() {
  if (!ObjectService) {
    ObjectService = require('../objectfactory/ObjectFactory').objectService;
  } else {
    return ObjectService;
  }
}

/** Exports */
module.exports = CreateOrUpdateRouteWorker;