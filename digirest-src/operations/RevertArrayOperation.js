/**
 * Created by Aureliano on 17/12/2015.
 * Operation that flip an array
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'RevertArrayOperation';


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _revert(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;


    try {

        if(Array.isArray(data)){
            var len = data.length;
            var newArray = [];
            for (var i = len- 1; i>=0; i--){
                newArray.push(data[i]);
            }
            funcParamObj.payload=newArray;
        }
        onExecuteComplete(null,funcParamObj);

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}


/** exports */
exports.revert=_revert;