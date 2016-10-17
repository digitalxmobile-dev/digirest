/**
 * Created by Aureliano on 19/11/2015.
 * This operation insert a new object
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ArrayInsertOperation';
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var async = require('async');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _insert(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var httpRequest = funcParamObj.request;
  var httpResponse = funcParamObj.response;
  var data = funcParamObj.payload;

  /** pre - operations on data */
  var collection = operationObj.conf['params.collection'];
  var newObjectsField = operationObj.conf['params.payload.array'];
  var lockPayload = operationObj.conf['params.payload.lock'];
  var fieldDest = operationObj.conf['params.dest.field'];


  try {

    /** verify and insert */
    async.waterfall([
        // insert obj
        function insert(callback) {
          _getObjectService().insertObject(data[newObjectsField], collection, callback);
        },
        // finalize
        function onOK(response, callback) {
          if (!lockPayload) {
            if (fieldDest) {
              funcParamObj.payload[fieldDest] = response;
            } else {
              funcParamObj.payload = response;
            }
          }
          onExecuteComplete(null, funcParamObj);
        }
      ],
      function onFinish(error, value) {
        if (error) {
          console.error((error));
        }
        onExecuteComplete(error, value);
      });

  } catch (err) {
    onExecuteComplete(err, funcParamObj);
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
exports.insert = _insert;
exports.invoke = _insert;