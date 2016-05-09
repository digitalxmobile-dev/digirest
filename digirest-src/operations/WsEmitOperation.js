/**
 * Created by Aureliano on 12/02/2016.
 * Emit on websocket operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'WsEmitOperation';
var WebSocketService = require('../objectfactory/ObjectFactory').webSocketService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _emit(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    try {

        _getWebSocketService().emit();
        onExecuteComplete(null,funcParamObj);

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
function _getWebSocketService(){
    if(!WebSocketService){
        WebSocketService = require('../objectfactory/ObjectFactory').webSocketService;
    }
    return WebSocketService;
}


/** exports */
exports.invoke=_emit;
exports.emit=_emit;