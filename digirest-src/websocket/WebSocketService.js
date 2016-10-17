/**
 * Created by Aureliano on 11/02/2016.
 * Web Socket Service based on Socket.IO
 */

var MODULE_NAME = 'WebSocketService';
var DYNAMIC_EVENTS = 'events.dynamic.all';
var EVENT_ROOT = 'event.';
var TRACELOG = 'tracelog';
var REGISTER_EVENT = 'register';
var DISCONNECT_EVENT = 'disconnect';
var PING_EVENT = 'echo_request';
var PING_RESPONSE = 'echo_response';
var SPECIAL_EVENTS = [REGISTER_EVENT, DISCONNECT_EVENT];
var ConfigurationService = require('../objectFactory/ObjectFactory').configurationService;
var OperationService = require('../objectfactory/ObjectFactory').operationService;
var async = require('async');
var underscore = require('underscore');
var socketIO = require('socket.io');

// init;
var io;
var clients = [];
var eventsConf = [];

/**
 * init webSocket
 * @param expressApp
 * @private
 */
function _init(httpServer, onComplete) {

  /** disable if not desired */
  if (!process.env.USE_WEBSOCKETS) {
    onComplete();
    return;
  }

  /** create socket */
  io = socketIO(
    httpServer,
    {
      'upgrade': true,
      'allowUpgrades': true,
      'match original protocol': true,
      'secure': true,
      'pingTimeout': 25000,
      'pingInterval': 10000
    }
  );

  /** waterfall the events init */
  async.waterfall([

      // get all events name
      function getWsEvents(wfcallback) {
        _getConfigurationService().getPropertiesArray(DYNAMIC_EVENTS, wfcallback);
      },

      // get single events
      function getSingleEvents(eventsArray, wfcallback) {

        async.each(eventsArray, function (event, eachCallback) {
          // Perform operation on file here.
          console.log(MODULE_NAME + ': processing event ' + event);
          _getConfigurationService().getPropertiesJsonByRoot(
            EVENT_ROOT + event,
            function onConfig(err, val) {
              eventsConf[event] = val;
              eachCallback(err);
            });

        }, function (err) {
          if (err) {
            console.error(MODULE_NAME + ': events processing FAILED');
            wfcallback(err);
          } else {
            console.log(MODULE_NAME + ': event conf loading ok');
            wfcallback();
          }

        });
      },

      // register events on socketio
      function register(wfcallbakc) {
        _registerSocketEvents(io, wfcallbakc);
      }
    ],
    onComplete
  );


}

/**
 * Register dynamic events on socket
 * @param io
 * @param onOk
 * @private
 */
function _registerSocketEvents(io, onOk) {
  io.on('connection',
    function onConnect(socket) {
      console.log(MODULE_NAME + ': connect');
      io.emit(TRACELOG, 'NEW USER CONNECTED ' + socket.id);
      clients.push(socket.id);

      /** simple tracelog activity */
      socket.on(TRACELOG, function chatMessage(msg) {
        io.emit(TRACELOG, this.id + ': ' + msg + '____________________');
        console.log(MODULE_NAME + ': tracelog ' + msg);
      });

      /** manage disconnection */
      socket.on(DISCONNECT_EVENT, function () {
        console.log(MODULE_NAME + 'Got disconnect!');

        // remove client from clientlists
        var i = clients.indexOf(socket);
        clients.splice(i, 1);
        io.emit(TRACELOG, 'disconnected user ' + socket.id);


        /** try using with operations chain */
        if (eventsConf.indexOf(DISCONNECT_EVENT)) {
          _wrapAndExecuteOperationChain(
            {},
            DISCONNECT_EVENT,
            eventsConf[DISCONNECT_EVENT],
            io,
            socket
          );
        }
      });

      /** simple heartbeat */
      socket.conn.on('heartbeat', function () {
        console.log(MODULE_NAME + ': heartbeat ' + socket.id);
        io.emit(TRACELOG, 'heartbeat ' + socket.id + ' - ' + JSON.stringify(clients));
      });

      /** register new user on socket events */
      socket.on(REGISTER_EVENT, function (token, callback) {
        console.log(MODULE_NAME + ': ' + REGISTER_EVENT + ' ' + socket.id);

        /** try using with operations chain */
        if (eventsConf.indexOf(REGISTER_EVENT)) {
          _wrapAndExecuteOperationChain(
            token,
            REGISTER_EVENT,
            eventsConf[REGISTER_EVENT],
            io,
            socket,
            callback
          );
        }
      });

      /** ping */
      socket.on(PING_EVENT, function (callback) {
        _emit(socket.id, PING_EVENT, 'questa è una echo request ma in realtà è una echo response');
        io.emit(TRACELOG, 'Piiiiiiiiiiiiiing');
      });

      // manage configurated events
      for (var iterator in eventsConf) {
        // skip managing special events
        if (!underscore.contains(SPECIAL_EVENTS, iterator)) {
          socket.on(iterator,
            function (payload, clientCallback) {
              console.log(MODULE_NAME + ': managing ' + iterator);
              _wrapAndExecuteOperationChain(
                payload,
                iterator,
                eventsConf[iterator],
                io,
                socket,
                clientCallback
              );
            }
          );
        }
      }
      ;

    });
}

/**
 * run operation chain in websocket
 * @param payload
 * @param name
 * @param conf
 * @param io
 * @param socket
 * @private
 */
function _wrapAndExecuteOperationChain(payload, name, conf, io, socket, clientCallback) {

  /** all operations to be executed */
  var operations = conf['conf.operations'].split(',');

  try {

    /** operations param obj */
    var paramObj = {};
    paramObj.request = {};
    paramObj.response = {};
    paramObj.event = name;
    paramObj.conf = conf;
    paramObj.socket = socket;
    paramObj.io = io;
    paramObj.clientCallback = clientCallback;

    try {
      paramObj.payload = JSON.parse(payload);
    } catch (error) {
      paramObj.payload = {};
      paramObj.payload.data = payload;
    }

    /** start executions */
    _getOperationService().executeChain(
      operations,
      paramObj,
      function onOperationsComplete(error, resultObj) {
        if (error) {
          var errorMessage;
          if (resultObj && resultObj.errorMessage) {
            errorMessage = resultObj.errorMessage;
          } else if (error.message && !process.env.HIDE_ERRORS) {
            errorMessage = error.message;
          }
          console.log(MODULE_NAME + ': ' + error);

          var msg = '';
          var res = resultObj.response;
          if (res.statusCode === 400) {
            //if was alredy set do nothing
            msg = errorMessage ? errorMessage : 'Bad Request';
          } else if (res.statusCode === 401) {
            msg = errorMessage ? errorMessage : 'Not Authorized';
          } else if (res.statusCode === 409) {
            msg = errorMessage ? errorMessage : 'Conflict';
          } else {
            msg = errorMessage ? errorMessage : 'Unknown Error';
            res.statusCode = 500;
          }
          res.msg = msg;
          if (clientCallback) {
            clientCallback(res);
          } else {
            io.to(socket.id).emit(name, res);
          }

        } else {

          if (!resultObj.skipsend) {

            var payload = (resultObj.payload) ? resultObj.payload : DEFAULT_PAYLOAD;
            if (clientCallback) {
              clientCallback(payload);
            } else {
              io.to(socket.id).emit(name, payload);
            }
          }
        }

      }
    )
  } catch (error) {
    if (clientCallback) {
      clientCallback(error.message);
    } else {
      io.to(socket.id).emit(name, error.message);
    }

  }
}


/**
 * emit new message
 * @param dest
 * @param event
 * @param payload
 * @param callback
 * @private
 */
function _emit(dest, event, payload, callback) {
  if (callback) {
    io.to(dest).emit(event, payload, callback);
  } else {
    io.to(dest).emit(event, payload);
  }
  console.log(MODULE_NAME + ':emit ' + event + ' - ' + JSON.stringify(payload));
  io.emit('tracelog', 'TO: ' + dest + ' ' + event + ' - ' + JSON.stringify(payload));
}


/**
 * getter for configuration service
 * @returns {*}
 * @private
 */
function _getConfigurationService() {
  if (!ConfigurationService) {
    ConfigurationService = require('../objectFactory/ObjectFactory').configurationService;
  }
  return ConfigurationService;
}

/**
 * return the run OperationService
 * @returns {*}
 * @private
 */
function _getOperationService() {
  if (!OperationService) {
    OperationService = require('../objectfactory/ObjectFactory').operationService;
  }
  return OperationService;

}


/** EXPORTS */
exports.init = _init;
exports.emit = _emit;
exports.TRACELOG = TRACELOG;



