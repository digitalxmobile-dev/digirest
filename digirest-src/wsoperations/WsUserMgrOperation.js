/**
 * Created by Aureliano on 17/02/2016.
 * manage websocket users
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'WsUserMgrOperation';
var WebSocketUserService = require('../objectfactory/ObjectFactory').webSocketUserService;
var WebSocketService = require('../objectfactory/ObjectFactory').webSocketService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _register(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var payload = funcParamObj.payload;
  var eventName = funcParamObj.event;
  var socket = funcParamObj.socket;
  var io = funcParamObj.io;
  var clientCallback = funcParamObj.clientCallback;

  try {

    _getWebSocketUserService().connect(
      socket.id,
      payload.data,
      function onOk(err, val, decoded) {
        var ret = err ? err : decoded;

        if (!err) {
          ret = {user: ret};
          ret.success = true;
          io.emit(_getWebSocketService().TRACELOG, eventName + ' ' + decoded._id);
          funcParamObj.payload.user = decoded;
        } else {
          ret.success = false;
          funcParamObj.errorMessage = ret;
        }

        if (clientCallback) {
          clientCallback(ret);
        } else {
          io.to(socket.id).emit(eventName, ret);
        }

        onExecuteComplete(err, funcParamObj);
      });

  } catch (error) {

    /** manage error in 2 ways:*/

    /** dispatch the error to the next op in chain */
    funcParamObj.errorMessage = error.message;
    onExecuteComplete(error, funcParamObj);

  }
}

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _disconnect(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var socket = funcParamObj.socket;

  try {
    _getWebSocketUserService().disconnect(socket.id);
    onExecuteComplete(null, funcParamObj);

  } catch (error) {

    /** dispatch the error to the next op in chain */
    funcParamObj.errorMessage = error.message;
    onExecuteComplete(error, funcParamObj);

  }
}

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _getUser(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var socket = funcParamObj.socket;

  try {
    var id_user = _getWebSocketUserService().getUser(socket.id);
    if (id_user) {
      funcParamObj.payload.id_user = id_user;
      onExecuteComplete(null, funcParamObj);
    } else {
      funcParamObj.errorMessage = 'User not registered';
      funcParamObj.response.statusCode = 401;
      onExecuteComplete(new Error(401), funcParamObj);
    }

  } catch (error) {

    /** dispatch the error to the next op in chain */
    funcParamObj.errorMessage = error.message;
    onExecuteComplete(error, funcParamObj);

  }
}


/**
 * return the run WebSocketUserService
 * @returns {*}
 * @private
 */
function _getWebSocketUserService() {
  if (!WebSocketUserService) {
    WebSocketUserService = require('../objectfactory/ObjectFactory').webSocketUserService;
  }
  return WebSocketUserService;

}

/**
 * return the run WebSocketUserService
 * @returns {*}
 * @private
 */
function _getWebSocketService() {
  if (!WebSocketService) {
    WebSocketService = require('../objectfactory/ObjectFactory').webSocketService;
  }
  return WebSocketService;

}


/** exports */
exports.register = _register;
exports.invoke = _register;
exports.disconnect = _disconnect;
exports.whois = _getUser;
