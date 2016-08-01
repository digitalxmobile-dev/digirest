/**
 * Created by Aureliano on 24/11/2015.
 * Push Parse operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'PushOperation';
var PushService = require('../objectfactory/ObjectFactory').pushService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _push(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    /** pre - operations on data */
    var pushObject = operationObj.conf['params.field.push'];
    var filterField = operationObj.conf['params.field.filter'];
    var devicesField = operationObj.conf['params.field.devices'];
    var conditionFiled = operationObj.conf['params.field.conditions'];
    var messageField = operationObj.conf['params.field.message'];
    var raisePushError = operationObj.conf['params.error.propagation'];

    /** operations on data */
    var filter,message,devices,conditions;
    if(pushObject){
        filter = data[pushObject].filter;
        message = data[pushObject].message;
    }else{
        filter = filterField ? data[filterField] : null;
        message = data[messageField];
    }




    try {

//        function _sendPushNotification(filter,devices,conditions,options,message,onPushSend){

            /** push the message */
        _getPushService().sendPushNotification(
            filter,
            devices,
            null,
            null,
            message,
            function onPushComplete(error,val){
                funcParamObj.payload = data;
                if(error){
                    if(raisePushError){
                        funcParamObj.payload = error;
                        console.error(error);
                        onExecuteComplete(error,funcParamObj);
                    }else{
                        console.error(error);
                        onExecuteComplete(null,funcParamObj);
                    }
                }else{
                    console.log(MODULE_NAME + ': Push Send OK');
                    console.log(MODULE_NAME + ': ' + JSON.stringify(val));
                    onExecuteComplete(null,funcParamObj);
                }

            }
        );

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}

/**
 * private gettter for parseService
 * @returns {*}
 * @private
 */
function _getPushService(){
    if(!PushService){
        PushService = require('../objectfactory/ObjectFactory').pushService;
    }
    return PushService;
}


/** exports */
exports.push=_push;