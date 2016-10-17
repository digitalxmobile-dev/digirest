/**
 * Created by Aureliano on 17/09/2015.
 * This file is a simple empty operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ObjectifyPayloadOperation';
var ObjectService = require('../objectfactory/ObjectFactory').objectService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _objectify(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** pre - operations on data */
    var payloadField = operationObj.conf['payload.field'];

    try {

        var toObjectify = data[payloadField];
        var objectified;
        if(Array.isArray(toObjectify)){
            // if is an array
            objectified = [];
            for(var i = 0; i<toObjectify.length; i++){
                objectified[i] = _getObjectified(toObjectify[i]);
            }
        }else{
            // if is a single value
            objectified = _getObjectified(toObjectify);
        }

        data[payloadField]=objectified;
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/**
 * get the object service version of data
 * @param objectIdString
 * @returns {*}
 * @private
 */
function _getObjectified(objectIdString){
    return _getObjectService().getObjectID(objectIdString);
}

/**
 * objectservice getter
 * @returns {*}
 * @private
 */
function _getObjectService(){
    if(!ObjectService){
        ObjectService = require('../objectfactory/ObjectFactory').objectService;
    }
    return ObjectService;
}


/** exports */
exports.objectify=_objectify;