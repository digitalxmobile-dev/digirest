/**
 * Created by Aureliano on 04/12/2015.
 * Operation that performs payload signing
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SignPayloadOperation';
var SecurityService = require('../objectfactory/ObjectFactory').securityService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _sign(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    /** get expire difference */
    var expire = operationObj.conf['params.expire'];
    var fromfield = operationObj.conf['params.payload.from'];
    var tofield = operationObj.conf['params.payload.to'];

    try {

        // create payload to sign
        var toBeSigned = data;
        if(fromfield){
            toBeSigned = {fromfield:toBeSigned[fromfield]};
        }


        // sign
        var jwtToken = _getSecurityService().signToken(
            toBeSigned,
            null, // no secret == default app secret,
            expire
        );

        // push back
        if(tofield){
            funcParamObj.payload[tofield] = jwtToken;
        }else{
            funcParamObj.payload = jwtToken;
        }

        // send
        onExecuteComplete(null,funcParamObj);


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
    return  require('../objectfactory/ObjectFactory').securityService;
}

/** exports */
exports.sign=_sign;
exports.invoke=_sign;