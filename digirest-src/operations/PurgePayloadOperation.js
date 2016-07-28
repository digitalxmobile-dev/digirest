/**
 * Created by Aureliano on 04/12/2015.
 * Operation that performs payload purge
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'PurgePayloadOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _purge(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** get expire difference */
    var remove = operationObj.conf['params.payload.remove'];
    var leave = operationObj.conf['params.payload.leave'];

    try {

        // get array of fields
        var fields = [];
        if(remove){
            fields = remove.split(',');
        }else if (leave){
            fields = leave.split(',');
        }

        // manage remove / leave
        var newdata = remove ? data : {};
        for(var iterator in fields){
            var current = fields[iterator];
            if(remove){
                if(current.split('.').length>1){
                    var keyArray = current.split('.');
                    var obj = newdata;
                    for(var it in keyArray){
                        if(it==keyArray.length-1){
                            delete obj[keyArray[it]];
                        }else{
                            obj = obj[keyArray[it]];
                        }
                    }
                }else {
                    delete newdata[current];
                }
            }else{
                newdata[current] = data[current];
            }
        }

        // packit
        funcParamObj.payload = newdata;

        // send
        onExecuteComplete(null,funcParamObj);


    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}


/** exports */
exports.purge=_purge;
exports.invoke=_purge;