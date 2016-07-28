/**
 * Created by Aureliano on 17/09/2015.
 * This file is a simple  operation that add a fixed value to the payload
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'TimeInfoOperation';
var underscore = require('underscore');

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
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** flag for update / new */
    var isnew = operationObj.conf['params.newobject'];
    var arrayObject = operationObj.conf['params.value.array'];


    try {

        var now = new Date();
        if(isnew && isnew===true) {
            var timeInfo = {
                '_t': 'TimeInfo',
                dt_creationDate: now,
                dt_lastUpdated: now
            };
            if (!arrayObject) {
                data.timeInfo = timeInfo;
            } else {
                data[arrayObject] = underscore.map(
                    data[arrayObject],
                    function initAll(obj) {
                        obj.timeInfo = timeInfo;
                        return obj;
                    });
            }
        }else{
            if(!arrayObject) {
                data['timeInfo.dt_lastUpdated'] = now;
            }else{
                data[arrayObject] = underscore.map(
                    data[arrayObject],
                    function initAll(obj) {
                        obj['timeInfo.dt_lastUpdated'] = now;
                        return obj;
                    });
            }
        }


        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** manage error in 2 ways:*/

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports.setval=_setVal;
exports.invoke=_setVal;