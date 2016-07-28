/**
 * Created by Aureliano on 17/09/2015.
 * This file is getter for a value received from the param
 *
 * take a value in the parameters of the request and execute a
 * replace in the qualification query obj.
 * then add the result (the _id) in the payload
 *
 * USE THIS AS A LOOKUP
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'GetObjectByParamOperation';
var ObjectService = require('../objectFactory/ObjectFactory').objectService;
var CacheService = require('../objectFactory/ObjectFactory').cacheService;
var ErrorService = require('../objectfactory/ObjectFactory').errorService;
var util = require('util');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _lookup(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var data = funcParamObj.payload;

    /** pre - operations on data */
    var query = operationObj.conf['params.query'];
    var reqparam = operationObj.conf['params.req.param.name'];
    var collection = operationObj.conf['params.collection'];
    var payloadField = operationObj.conf['params.payload.field'];
    var skipDoubleConversion = operationObj.conf['params.skipparse'];
    var saveWholeObject = operationObj.conf['params.saveobject'];
    var useCache = operationObj.conf['params.usecache'];
    var cacheTime = operationObj.conf['params.cachetime'];

    try {
        query = util.format(query,httpRequest.params[reqparam]);

        query = eval('(' + query + ')')

        if(!skipDoubleConversion) {
            query = JSON.stringify(query);
            query = JSON.parse(query);
        }


        var onGetData = function onGetData(error,obj){
            if(error){
                onExecuteComplete(error,null);
            }else{
                try {
                    _getCacheService().put(collection + JSON.stringify(query), obj, cacheTime ? cacheTime : 180000); //3 minutes cache
                }catch(err){
                    err.query = query;
                    err.obj = obj;
                    _getErrorService().traceError(err,MODULE_NAME);
                }
                if(obj && !saveWholeObject) {
                    data[payloadField] = obj['_id'];
                }else if (obj && saveWholeObject){
                    if(payloadField) {
                        data[payloadField] = obj;
                    }else{
                        data=obj;
                    }
                }else{
                    if(payloadField) {
                        data[payloadField] = {};
                    }else{
                        data={};
                    }
                }

                try {
                    if(process.env.PRINT_QUERY) {
                        var stringed = JSON.stringify(query);
                        stringed = stringed.substring(0,Math.min(stringed.length,50));
                        console.log(MODULE_NAME + ': getObjectByQualification: ' + stringed);
                    }
                }catch(err){
                    err=null;
                }

                funcParamObj.payload = data;
                /** callback with funcParamObj updated */
                onExecuteComplete(null,funcParamObj);
            }
        };




        if(useCache){
            var result = _getCacheService().get(collection + JSON.stringify(query));
            if(result){
                onGetData(null,result);
            }
        }

        /** execute the lookup */
        _getObjectService().getObjectByQualification(
            query,
            collection,
            onGetData
        );

    }catch(error){

        funcParamObj.errorMessage = error.message;
        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}

/**
 * Object service getter
 * @returns {*}
 * @private
 */
function _getObjectService(){
    if(!ObjectService){
        ObjectService = require('../../digirest-src/objectFactory/ObjectFactory').objectService;
    }
    return ObjectService;
}

/**
 * getter for cache service
 * @returns {*}
 * @private
 */
function _getCacheService(){
    if(!CacheService){
        CacheService = require('../../digirest-src/objectFactory/ObjectFactory').cacheService;
    }
    return CacheService;
}
/**
 * private getter for error service
 * @returns {*}
 * @private
 */
function _getErrorService(){
    if(!ErrorService){
        ErrorService = require('../objectfactory/ObjectFactory').errorService;
    }else{
        return ErrorService;
    }
}


/** exports */
exports.lookup=_lookup;
exports.invoke=_lookup;