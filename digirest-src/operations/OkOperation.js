/**
 * Created by Aureliano on 26/01/2016.
 * This file is a simple  operation that return OK
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'OkOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _setVal(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    var condition = operationObj.conf['params.condition'];
    var errorMessage = operationObj.conf['params.ko.message'];
    var okMessage = operationObj.conf['params.ok.message'];

    try {

        if(!condition || eval(condition)) {

            var newdata = {};
            newdata.success = true;

            if(okMessage){
                newdata.message = eval(okMessage);
            }

            funcParamObj.payload = newdata;
            onExecuteComplete(null, funcParamObj);

        }else{

            var newdata = {};
            newdata.success = false;

            if(errorMessage){
                newdata.message = eval(errorMessage);
            }

            funcParamObj.payload = newdata;
            onExecuteComplete(null, funcParamObj);

        }


    }catch(error){

        /** manage error in 2 ways:*/
        console.error(error);

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports.invoke=_setVal;
