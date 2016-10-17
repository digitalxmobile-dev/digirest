/**
 * Created by Aureliano on 25/01/2016.
 * This operation check for duplicates
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'DuplicateCheckOperation';
var ObjectService = require('../objectFactory/ObjectFactory').objectService;
var util = require('util');
var async = require('async');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _validate(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var httpRequest = funcParamObj.request;
  var httpResponse = funcParamObj.response;
  var data = funcParamObj.payload;

  /** pre - operations on data */
  var collection = operationObj.conf['params.collection'];
  var query = operationObj.conf['params.query.expression'];
  var qualifications = (operationObj.conf['params.query.qualification']) ? operationObj.conf['params.query.qualification'].split(',') : [];
  var message = operationObj.conf['params.error.message'];

  // replace qualifications
  var isValid = false;
  for (var i = 0; i < qualifications.length; i++) {
    if (data[qualifications]) {
      query = util.format(query, data[qualifications[i]]);
      isValid = true;
    }
  }

  try {

    if (isValid) {
      async.waterfall([
          function getObject(callback) {
            _getObjectService().getObjectByQualification(JSON.parse(query), collection, callback);
          },
          function verify(obj, callback) {
            if (obj) {
              funcParamObj.errorMessage = message;
              httpResponse.statusCode = 409;
              onExecuteComplete(new Error(), funcParamObj);
            } else {
              onExecuteComplete(null, funcParamObj);
            }
          }
        ]
      );
    } else {
      onExecuteComplete(null, funcParamObj);
    }

  } catch (error) {
    /** dispatch the error to the next op in chain */
    onExecuteComplete(error, funcParamObj);
  }
}

/**
 * Object service getter
 * @returns {*}
 * @private
 */
function _getObjectService() {
  if (!ObjectService) {
    ObjectService = require('../../digirest-src/objectFactory/ObjectFactory').objectService;
  }
  return ObjectService;
}

/** exports */
exports.validate = _validate;
exports.invoke = _validate;

