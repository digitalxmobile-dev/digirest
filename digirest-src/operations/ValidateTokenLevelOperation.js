/**
 * Created by Aureliano on 20/11/2015.
 * Operation that performs securiy check on decoded fields of request
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ValidateTokenLevelOperation';
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
    var field = operationObj.conf['params.field'];
    var value = operationObj.conf['params.value'];
    var higherPrivilege = operationObj.conf['params.admin'] ? operationObj.conf['params.admin'].split(','): [];

    if(httpRequest.decoded && httpRequest.decoded[field] && (httpRequest.decoded[field] === value || underscore.contains(higherPrivilege,httpRequest.decoded[field]))){
        onExecuteComplete(null, funcParamObj)
    }else{
        httpResponse.status(401);
        onExecuteComplete(new Error('401'), funcParamObj);
    }

}



/** exports */
exports.validate=_validate;
exports.invoke=_validate;