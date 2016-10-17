/**
 * Created by Aureliano on 20/11/2015.
 * Operation that performs securiy check on decoded fields of request
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ValidateObjectLevelOperation';
var underscore = require('underscore');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _validate(funcParamObj,onExecuteComplete){

    /** dev skips */
    if(process.env.ENV=='development' && process.env.SKIP_AUTH=='true') {
        return onExecuteComplete(null, funcParamObj);
    }

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;

    /** get expire difference */
    var field = operationObj.conf['params.payload.field'];
    var key = operationObj.conf['params.decoded.field'];
    var higherPrivilege = operationObj.conf['params.admin'] ? operationObj.conf['params.admin'].split(','): [];

    /** if empty, skip validation */
    if(underscore.isEmpty(funcParamObj.payload)){
        onExecuteComplete(null, funcParamObj);
        return;
    }

    /** get data */
    var privilege = httpRequest.decoded['cd_privilege'];
    var value = _getValue(funcParamObj.payload,field);
    var identifier = _getValue(httpRequest.decoded,key);
    if(!value||(value==identifier || underscore.contains(higherPrivilege,privilege))){
        /** I'm admin or is my object */
        onExecuteComplete(null, funcParamObj)
    }else{
        /** it's not my object */
        console.log(MODULE_NAME + ': operation blocked by ACL ' + value + " "  + identifier)
        httpResponse.status(401);
        funcParamObj.errorMessage = 'Operation Blocked by ACL';
        onExecuteComplete(new Error('401'), funcParamObj);
    }

}

/**
 * get the requested value
 * @param obj
 * @param field
 * @returns {*}
 * @private
 */
function _getValue(obj,field){
    if (obj && field.indexOf('.') == -1) {
        if (obj[field]) {
            return obj[field];
        } else {
            return obj['_id'];
        }
    } else {
        if(obj) {
            var fieldStep = field.split('.');
            for (var i = 0; i < fieldStep.length; i++) {
                if(obj){
                    obj = obj[fieldStep[i]];
                }
            }
        }
        return obj;
    }
}


/** exports */
exports.invoke=_validate;