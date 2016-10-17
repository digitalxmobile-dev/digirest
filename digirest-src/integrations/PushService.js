/**
 * Created by Aureliano on 02/02/2016.
 * service for parse
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'PushService';
const extend = require('util')._extend;
const Pushwoosh = require('dgx-pushwoosh-client');
if (process.env.PW_APPCODE && process.env.PW_AUTHCODE) {
  var pushwooshClient = new Pushwoosh(process.env.PW_APPCODE, process.env.PW_AUTHCODE);
}

/**
 *
 * @param channel
 * @param message
 * @param linkedId
 * @param onPushSend
 * @private
 */
function _sendPushNotification(filter, devices, conditions, options, message, onPushSend) {

  if (!options) {
    options = {};
  }

  var localOptions = {
    "platforms": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    //,filter: "notconnected6"
  };

  if (options) {
    options = extend(localOptions, options);
  }

  if (filter) {
    options.filter = filter;
  }

  if (devices) {
    options.devices = devices;
  }

  if (conditions) {
    options.conditions = conditions;
  }

  if (!message) {
    message = 'empty message,set content';
  }

  if (process.env.ENV == 'development') {
    console.log(MODULE_NAME + ': ' + JSON.stringify(options));
  }

  pushwooshClient.sendMessage(message, devices, options, onPushSend);

}


/** Exports */
exports.sendPushNotification = _sendPushNotification;

