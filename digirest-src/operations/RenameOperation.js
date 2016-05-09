/**
 * Created by Aureliano on 26/01/2016.
 * This file is a simple  operation that return OK
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'RenameOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _setVal(funcParamObj, onExecuteComplete, data2) {
    data2 = data2 || data;

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    var original = operationObj.conf['params.original'].split(',');
    var destination = operationObj.conf['params.destination'].split(',');
    var deleteOriginal = operationObj.conf['params.delete'] || true;

    try {

        var len = original.length;
        if(len!=destination.length){
            onExecuteComplete(new Error(400),funcParamObj);
        }else{
            for(var i=0; i<len; i++){
                data[destination[i]]=data[original[i]];
                if(deleteOriginal){
                    delete data[original[i]];
                }
            }
            funcParamObj.payload = data;
            onExecuteComplete(null, funcParamObj);
        }

    }catch(error){

        console.error(error);
        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports.invoke=_setVal;
