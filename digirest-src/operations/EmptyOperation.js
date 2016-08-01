/**
 * Created by Aureliano on 17/09/2015.
  * This file is a simple empty operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'EmptyOperation';


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _operationFunction(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    try {

        /** do what you need */
        console.log('___Hello Operation World___');

        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(operationErrorSuperDangerous){

        /** manage error in 2 ways:*/

        /** dispatch the error to the next op in chain */
        onExecuteComplete(operationErrorSuperDangerous,funcParamObj);

        /** OR */

        /** break the chain */
        httpResponse.status(500);
        httpResponse.send(JSON.stringify(operationErrorSuperDangerous));
    }
}

/** exports */
exports.execute=_operationFunction;