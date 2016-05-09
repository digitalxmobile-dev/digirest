/**
 * Created by Aureliano on 22/09/2015.
 * this operation value from parameters
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'GetParameterOperation';
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var underscore = require('underscore');
var DatingJson = require('datingjson')

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _getParams(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    try {

        // init data
        if(!data){
            data = {}
        }

        // skip operation if coming from socket - no httprequest
        if(!funcParamObj.io) {

            // req body
            var keys = Object.keys(httpRequest.body);
            for (var iterator in keys) {
                _getValue(data, keys[iterator], httpRequest.body, httpResponse);
            }

            // req params
            keys = Object.keys(httpRequest.params);
            for (var iterator in keys) {
                _getValue(data, keys[iterator], httpRequest.params, httpResponse);
            }

            // req query
            keys = Object.keys(httpRequest.query);
            for (var iterator in keys) {
                _getValue(data, keys[iterator], httpRequest.query, httpResponse);
            }

            //replace "[xx,yy]" string with array
            keys = Object.keys(data);
            for (var iterator in keys) {
                var key = keys[iterator];
                var value = data[key];
                if (value && value.indexOf && value.indexOf('[') == 0 && value.indexOf(']') == (value.length - 1)) {
                    value = value.substring(1, (value.length - 1));
                    value = value.split(',');
                    data[key] = value;
                }
            }

            //debug purpose
            if (process.env.PRINT_REQUEST_PARAM) {
                console.log(MODULE_NAME + ': PRINT_REQUEST_PARAM [' + JSON.stringify(data) + ']');
            }

            //get rawbody
            if (httpRequest.rawBody) {
                //data.rawBody = httpRequest.rawBody.toString('binary');
                data.rawBody = httpRequest.rawBody;
            }
        }


        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** manage error in 2 ways:*/

        /** dispatch the error to the next op in chain */
        funcParamObj.errorMessage=error.message;
        onExecuteComplete(error,funcParamObj);

    }
}

/**
 * get the value
 * @param data
 * @param key
 * @param obj
 * @private
 */
function _getValue(data,key,obj,response){
    var value = obj[key];
    if(key==='_id') {  /** MONGO ID */
        try {
            data[key] = _getObjectService().getObjectID(value);
        } catch (Error) {
            // bad request
            response.statusCode = 400;
            throw Error;
        }
    }else if (value=='false'){  /** BOOLEAN FALSE */
        data[key]=false;
    }else if (value=='true'){   /** BOOLEAN TRUE */
        data[key]=true;
    }else if (key.slice(0,3)==='dt_') {  /** DATES */
        try {
            var dateConverter = new DatingJson();
            data[key] = dateConverter.convert(value);
        } catch (Error) {
            data[key] = value;
        }
    }else if (underscore.isObject(value)) { /** OBJECT */
    data[key] = value;

    }else {
        data[key] = value;
    }
}

/**
 * return the object service
 * @returns {*}
 * @private
 */
function _getObjectService(){
    if(!ObjectService){
        ObjectService =  require('../objectfactory/ObjectFactory').objectService;
    }
    return ObjectService;
}

/** exports */
exports.getParams=_getParams;
exports.invoke=_getParams;