/**
 * Created by Aureliano on 15/02/2016.
 * Web Socket User Service
 */

var MODULE_NAME = 'WebSocketUserService';
var SecurityService = require('../objectFactory/ObjectFactory').securityService;
var async = require('async');
var underscore = require('underscore');
var connectedUser = [];   // connectedUser[userid] = [socketid,socketid2,...]
var connectedSocket = []; // connectedSocket[socketid] = userid;


/**
 * Connect Socket
 * @param socketid
 * @param token
 * @param onOk
 * @private
 */
function _connect(socketid, token, onOk) {
  _getSecurityService().verifyToken(
    token,
    function onVerify(err, decoded) {
      if (err) {
        onOk(err);

      } else if (decoded) {
        if (!connectedUser[decoded._id]) {
          connectedUser[decoded._id] = [];
        }
        if (!underscore.contains(connectedUser[decoded._id], socketid)) {
          connectedUser[decoded._id].push(socketid);
        }
        connectedSocket[socketid] = decoded._id;
        onOk(null, connectedUser[decoded._id], decoded);
      } else {
        // do nothing, should never pass here
        console.error('something rare in WebSocketUserService');
      }
    });
}

/**
 * Disconnect socket
 * @param socketid
 * @param onOk
 * @private
 */
function _disconnect(socketid) {
  var userArray = underscore.find(
    underscore.values(connectedUser),
    function (obj) {
      return (underscore.contains(obj, socketid));
    });

  if (userArray) {
    userArray.splice(underscore.indexOf(socketid), 1)
  }

  delete connectedSocket[socketid];

  return;
}

/**
 * get sockets by id
 * @param userid
 * @returns {*}
 * @private
 */
function _getSockets(userid) {
  return connectedUser[userid];
}

/**
 * get user by id
 * @param socketid
 * @returns {*}
 * @private
 */
function _getUser(socketid) {
  return connectedSocket[socketid];
}
/**
 * getter for configuration service
 * @returns {*}
 * @private
 */
function _getSecurityService() {
  if (!SecurityService) {
    SecurityService = require('../objectfactory/ObjectFactory').securityService;
  }
  return SecurityService;
}

/** Exports */
exports.connect = _connect;
exports.disconnect = _disconnect;
exports.getSockets = _getSockets;
exports.getUser = _getUser;
