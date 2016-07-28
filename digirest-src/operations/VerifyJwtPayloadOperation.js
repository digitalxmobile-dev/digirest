/**
 * Created by Aureliano on 04/12/2015.
 * Operation that performs payload signing
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'VerifyJwtPayloadOperation';
var SecurityService = require('../objectfactory/ObjectFactory').securityService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _verify(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** get expire difference */
    var fromfield = operationObj.conf['params.payload.from'];

    try {

        // get the data and verify against JWT
        var toBeVerified = data[fromfield];

        _getSecurityService().verifyToken(
            toBeVerified,
            function onVerify(err,val){
                if(err){
                    httpResponse.statusCode = 403;
                    funcParamObj.errorMessage = 'Failed to authenticate token.';
                    console.error(err,MODULE_NAME + " failed to auth token");
                    onExecuteComplete(err,funcParamObj);
                }else{
                    onExecuteComplete(null,funcParamObj);
                }
            }
        )


    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}

/**
 * private gettter for run query service
 * @returns {*}
 * @private
 */
function _getSecurityService(){
    if(!SecurityService){
        SecurityService = require('../objectfactory/ObjectFactory').securityService;
    }
    return SecurityService;
}

/** exports */
exports.verify=_verify;
exports.invoke=_verify;