/**
 * Created by Aureliano on 07/10/2015.
 * This file invalidate a cache key
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'InvalidateCacheKeyOperation';
var CacheService = require('../objectFactory/ObjectFactory').cacheService;
var util = require('util');


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _invalidate(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var httpRequest = funcParamObj.request;
  var httpResponse = funcParamObj.response;
  var data = funcParamObj.payload;

  /** operation configuration */
  var cacheKey = operationObj.conf['params.cachekey'];
  var qualifications = operationObj.conf['params.qualifications'] ? operationObj.conf['params.qualifications'].split(',') : [];

  /** release the route */
  funcParamObj.payload = data;
  onExecuteComplete(null, funcParamObj);

  try {
    var query = {};

    // create the query
    for (var i = 0; i < qualifications.length; i++) {
      var fieldName = qualifications[i];
      var value = data[fieldName];
      cacheKey = util.format(cacheKey, value);
    }

    // invalidate cache
    var result = _getCacheService().del(cacheKey);
    if (result && result === true) {
      console.log(MODULE_NAME + ": cache key invalidated [" + cacheKey + "]");
    } else {
      console.log(MODULE_NAME + ": cache key invalidation FAIL [" + cacheKey + "]");
    }


  } catch (error) {

    /** dispatch the error to the next op in chain */
    onExecuteComplete(error, funcParamObj);

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
exports.invalidate = _invalidate;
exports.invoke = _invalidate;
