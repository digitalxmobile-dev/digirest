/**
 * Created by Aureliano on 13/01/2016.
 * replace the data with the first occurance in array
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'UnArrayOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _invoke(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** get expire difference */
    var fromField = operationObj.conf['params.field.from'];
    var toField = operationObj.conf['params.field.to'];

    try {

        var array;
        var newdata;
        if (fromField){
            array = data[fromField];
        }else{
            array = data;
        }

        newdata = array[0];

        if (toField){
            data[toField] = newdata;
        }else{
            data = newdata;
        }

        // packit
        funcParamObj.payload = data;

        // send
        onExecuteComplete(null,funcParamObj);


    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}


/** exports */
exports.invoke=_invoke;