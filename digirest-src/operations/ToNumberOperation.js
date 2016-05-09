/**
 * Created by Aureliano on 10/02/2016.
 * This file is a simple change payload operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ToNumberOperation';


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

    try {

        var fromfield = operationObj.conf['params.from'];
        var tofield = operationObj.conf['params.to'];
        var removeoriginal = operationObj.conf['params.remove']; //default false

        /** callback with funcParamObj updated - maybe */
        if(funcParamObj.payload[fromfield] && !isNaN(funcParamObj.payload[fromfield])) {
            funcParamObj.payload[tofield] = parseInt(funcParamObj.payload[fromfield]);
            if (removeoriginal) {
                delete funcParamObj[fromfield];
            }
        }
        onExecuteComplete(null, funcParamObj);

    }catch(error){
        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}

/** exports */
exports.invoke=_operationFunction;