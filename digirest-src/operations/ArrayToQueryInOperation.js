/**
 * Created by Aureliano on 02/03/2016.
 * This file is distinct operations
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ArrayToQueryInOperation';
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var underscore = require('underscore');
/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _arrayToIN(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var data = funcParamObj.payload;

  /** pre - operations on data */
  var fieldFrom = operationObj.conf['params.field.from'];
  var fieldTo = operationObj.conf['params.field.to']
  var convertToID = operationObj.conf['params.convertid'];

  try {
    var arrayValue = data[fieldFrom];
    if (arrayValue) {
      if (convertToID) {
        arrayValue = underscore.map(arrayValue, _mongify);
      }
      if (underscore.isArray(arrayValue)) {
        if (fieldTo) {
          data[fieldTo] = {'$in': arrayValue};
        } else {
          data[fieldFrom] = {'$in': arrayValue};
        }
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);
      } else {
        funcParamObj.errorMessage = 'Object is not an array';
        funcParamObj.response.statusCode = 400;
        onExecuteComplete(new Error(400), funcParamObj);
      }
    } else {
      onExecuteComplete(null, funcParamObj);
    }

  } catch (error) {

    /** dispatch the error to the next op in chain */
    onExecuteComplete(error, funcParamObj);
  }
}

/**
 * create the objectid obj from string
 * @param obj
 * @returns {*}
 * @private
 */
function _mongify(obj) {
  return _getObjectService().getObjectID(obj);
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
exports.invoke = _arrayToIN;