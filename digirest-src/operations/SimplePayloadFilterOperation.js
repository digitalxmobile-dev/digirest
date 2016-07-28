/**
 * Created by Aureliano on 22/09/2015.
 */
/**
 * Created by Aureliano on 17/09/2015.
 * This operations clean the payload
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SimplePaylodFilterOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _filter(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** get parameters */
    var qualificationsFrom = operationObj.conf['params.payload.from'].split(',');
    var qualificationsTo = operationObj.conf['params.payload.to'] // optional;
    if(qualificationsTo)qualificationsTo = qualificationsTo.split(',');

    try {

        // init data
        if(!data){
            throw new Error(MODULE_NAME + ': NO PAYLOAD');
        }

        //create the new payload
        var newData = {};
        for(var i=0; i<qualificationsFrom.length; i++) {
            var key = qualificationsFrom[i];
            var value = data[key];
            if(key && key.indexOf && key.indexOf('.')!=-1) {
                var keySplitted = key.split('.');
                for (var j = 0; j < keySplitted.length; j++) {
                    if(value) {
                        value = value[keySplitted[j]];
                    }else{
                        value = data[keySplitted[j]];
                    }
                }
            }
            if (value && !qualificationsTo) {
                newData = value;
            } else if (value && qualificationsTo && qualificationsTo[i]) {
                newData[qualificationsTo[i]] = value;
            }

        }


        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = newData;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** manage error in 2 ways:*/

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports.filter=_filter;