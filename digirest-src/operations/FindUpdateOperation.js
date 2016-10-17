/**
 * Created by Aureliano on 17/09/2015.
 * This file is a findupdate operation (with timing set)
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'FindUpdateOperation';
var RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var CloneFactory = require('cloneextend');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _update(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var httpRequest = funcParamObj.request;
  var httpResponse = funcParamObj.response;
  var data = funcParamObj.payload;

  /** pre - operations on data */
  var collection = operationObj.conf['params.collection'];
  var qualifications = operationObj.conf['params.query.qualification'].split(',');

  /** set up the qualification obj */
  var objQualification = {};
  for (var i = 0; i < qualifications.length; i++) {
    var fieldName = qualifications[i];
    objQualification[fieldName] = data[fieldName];
    if (!objQualification[fieldName]) {
      httpResponse.sendStatus(400);
      httpResponse.send();
      return;
    }
  }

  /** prepare insert timing to payload */
  var insertTimeInfo = {};
  insertTimeInfo['_t'] = 'TimeInfo';
  insertTimeInfo['dt_creationDate'] = new Date();
  insertTimeInfo['dt_lastUpdated'] = insertTimeInfo['dt_creationDate'];

  /** prepare update payload */
  var objSet = CloneFactory.clone(data);
  objSet['timeInfo.dt_lastUpdated'] = new Date();
  var objUpdate = {};
  objUpdate['$set'] = objSet;

  console.log(MODULE_NAME + ": qualification [" + JSON.stringify(objQualification) + ']');

  try {

    /** try the update */
    _getObjectService().updateObject(
      objQualification,
      collection,
      objUpdate,
      null,
      function onComplete(error, obj) {
        // if found, ok
        if (obj && obj.value) {
          funcParamObj.payload = obj.value;
          // FIXME obj.value contiene l'oggetto prima dell'update
          console.log(MODULE_NAME + ": update ok [" + JSON.stringify(obj) + ']');
          onExecuteComplete(null, funcParamObj);
        } else if (error) {
          onExecuteComplete(error, funcParamObj);
        } else {
          // if fail, insert new
          data.timeInfo = insertTimeInfo;
          _getRunQueryService().runInsert(
            collection,
            data,
            function onInsert(error, insertRes) {
              if (insertRes && insertRes.result && insertRes.result.ok === 1) {
                console.log(MODULE_NAME + ": insert ok [" + JSON.stringify(insertRes) + ']');
                onExecuteComplete(null, funcParamObj);
              } else {
                if (error && error.name == 'MongoError' && error.code == 11000) {
                  // duplicate key error
                  httpResponse.status(400)
                }
                console.log(MODULE_NAME + ": insert FAIL [" + JSON.stringify(insertRes) + ']');
                onExecuteComplete(error, funcParamObj);
              }
            });
        }
      });

  } catch (operationError) {

    /** break the chain */
    httpResponse.status(500);
    httpResponse.send(JSON.stringify(operationErrorSuperDangerous));
  }
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

/** exports */
exports.update = _update;