/**
 * Created by Aureliano on 21/09/2015.
 * This file is distinct operations
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'DistinctOperation';
var RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _runDistinct(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var httpRequest = funcParamObj.request;
  var httpResponse = funcParamObj.response;
  var data = funcParamObj.payload;

  /** pre - operations on data */
  var collection = operationObj.conf['params.collection'];
  var qualifications = operationObj.conf['params.query.qualification'].split(',');
  var distinct = operationObj.conf['params.distinct'];
  var options = operationObj.conf['params.options'];
  var cachetime = operationObj.conf['params.cachetime'];
  var payloadfieldinsert = operationObj.conf['params.payload.field.insert'];

  /** fix the cachetime */
  if (cachetime === 'forever') {
    cachetime = null;
  } else if (!cachetime) {
    cachetime = 0;
  }


  /** set up the qualification obj */
  var objQualification = {};
  for (var i = 0; i < qualifications.length; i++) {
    var fieldName = qualifications[i];
    objQualification[fieldName] = data[fieldName];
  }

  try {
    /** run the distinct */
    _getRunQueryService().runCachedDistinct(
      collection,
      distinct,
      objQualification,
      options,
      cachetime,
      function onComplete(error, values) {
        if (!error && values) {
          if (payloadfieldinsert) {
            funcParamObj.payload[payloadfieldinsert] = values;
          } else {
            funcParamObj.payload = values;
          }
        } else {
          funcParamObj.payload = JSON.stringify(error);
        }
        onExecuteComplete(error, funcParamObj);
      }
    );

  } catch (error) {

    /** dispatch the error to the next op in chain */
    onExecuteComplete(error, funcParamObj);
  }
}

/**
 * private gettter for run query service
 * @returns {*}
 * @private
 */
function _getRunQueryService() {
  if (!RunQueryService) {
    RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
  }
  return RunQueryService;
}

/** exports */
exports.runDistinct = _runDistinct;
exports.invoke = _runDistinct;