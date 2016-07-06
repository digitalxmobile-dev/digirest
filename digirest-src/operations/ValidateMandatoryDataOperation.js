/**
 * Created by Aureliano on 16/11/2015.
 * This operation validate data in payload
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ValidateMandatoryDataOperation';
var underscore = require('underscore');
var specialFields = ['_id'];


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _validate(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** get validate data fields */
    var mandatoryFields = operationObj.conf['params.mandatory.fields'] ? operationObj.conf['params.mandatory.fields'].split(',') : null;
    var allowedFields = operationObj.conf['params.allowed.fields'] ? operationObj.conf['params.allowed.fields'].split(',') : null;
    var arrayObject = operationObj.conf['params.value.array'];

    if(!arrayObject) {
        var mandatory = _validateMandatory(mandatoryFields, data, funcParamObj, httpResponse, onExecuteComplete);
        if(!mandatory)return;
        var allowed = _validateAllowed(allowedFields, data, funcParamObj, httpResponse, onExecuteComplete);
        if(!allowed)return;

    }else{
        for(var obj of data[arrayObject]){
            var mandatory = _validateMandatory(mandatoryFields, obj, funcParamObj, httpResponse, onExecuteComplete);
            if(!mandatory)return;
            var allowed = _validateAllowed(allowedFields, obj, funcParamObj, httpResponse, onExecuteComplete);
            if(!allowed)return;
        }
    }


    /** callback with funcParamObj updated - maybe */
    funcParamObj.payload = data;
    onExecuteComplete(null, funcParamObj);

}

/**
 * validate allowed
 * @param allowedFields
 * @param data
 * @param funcParamObj
 * @param httpResponse
 * @param onExecuteComplete
 * @returns {boolean}
 * @private
 */

function _validateAllowed(allowedFields, data, funcParamObj, httpResponse, onExecuteComplete) {
    /** validate allowed field */
    if (allowedFields) {
        var keys = Object.keys(data);
        for (var iterator in keys) {
            //_getValue(data,keys[iterator],httpRequest.query,httpResponse);
            var fieldName = keys[iterator];
            if (underscore.indexOf(allowedFields, fieldName) == -1 && underscore.indexOf(specialFields, fieldName) == -1) {
                console.log(MODULE_NAME + ': error UNALLOWED FIELD ' + fieldName);
                funcParamObj.errorMessage = 'error UNALLOWED FIELD ' + fieldName;
                httpResponse.statusCode = 400;
                onExecuteComplete(new Error(400), funcParamObj);
                return false;
            }
        }
    }
    return true;
}

/**
 * validate mandatory
 * @param mandatoryFields
 * @param data
 * @param funcParamObj
 * @param httpResponse
 * @param onExecuteComplete
 * @private
 */
function _validateMandatory(mandatoryFields, data, funcParamObj, httpResponse, onExecuteComplete) {
    /** validate mandatory data */
    if (mandatoryFields) {
        for (var i = 0; i < mandatoryFields.length; i++) {
            var fieldName = mandatoryFields[i];
            if (!isPresent(data[fieldName])) {
                console.log(MODULE_NAME + ': error MISSING MANDATORY FIELD ' + fieldName);
                funcParamObj.errorMessage = 'error MISSING MANDATORY FIELD ' + fieldName;
                httpResponse.statusCode = 400;
                onExecuteComplete(new Error(400), funcParamObj);
                return false;
            }
        }
    }
    return true;
}

/**
 * test if is present
 * @param value
 * @returns {boolean}
 */
function isPresent(value){
    if (value) return true;
    if (value===null) return false;
    if (value==undefined) return false;
    if (value===0) return true
    if (value===false) return true;
}
/** exports */
exports.validate=_validate;
exports.invoke=_validate;

