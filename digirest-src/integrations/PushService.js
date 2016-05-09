/**
 * Created by Aureliano on 02/02/2016.
 * service for parse
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'PushService';
var Pushwoosh  = require('dgx-pushwoosh-client');
if(process.env.PW_APPCODE && process.env.PW_AUTHCODE) {
    var pushwooshClient = new Pushwoosh(process.env.PW_APPCODE, process.env.PW_AUTHCODE);
}
var extend = require('util')._extend;

/**
 *
 * @param channel
 * @param message
 * @param linkedId
 * @param onPushSend
 * @private
 */
function _sendPushNotification(filter,devices,conditions,options,message,onPushSend){

    if(!options){
        options = {};
    }

    var localOptions = {
        "platforms": [1,2,3,4,5,6,7,8,9,10,11]
        //,filter: "notconnected6"
    };

    if(options){
        options = extend(localOptions,options);
    }

    if(filter){
        options.filter = filter;
    }

    if(devices){
        options.devices = devices;
    }

    if(conditions){
        options.conditions=conditions;
    }

    if(!message){
        message = 'empty message,set content';
    }

    if(process.env.ENV == 'development'){
        console.log(MODULE_NAME + ': ' + JSON.stringify(options));
    }

    pushwooshClient.sendMessage(message,devices,options,onPushSend);

}


/** Exports */
exports.sendPushNotification=_sendPushNotification;

/***** OLD FUNCTION ***/
//function _sendPushNotification(channel,message,linkedId,onPushSend) {

 //if(process.env.PUSH_ENABLED==true || process.env.PUSH_ENABLED=='true') {
    //    // set up query
    //    //var query = new Parse.Query(Parse.Installation);
    //    //query.equalTo('notifEnabled', true);
    //    // set up channel
    //    var channelArray = [];
    //    channelArray[0] = channel;
    //    //query.equalTo('channels',channelArray);
    //    // set up data
    //    var data;
    //    if(linkedId) {
    //        data = {
    //            alert: message,
    //            objectId: linkedId,
    //            badge: '1',
    //            sound: "default"
    //        };
    //    }else{
    //        data = {
    //            alert: message,
    //            badge: '1',
    //            sound: "default"
    //        };
    //    }
    //    // send push
    //    Parse.Push.send({
    //        //where: {'notifEnabled': "true", 'channels': channel},
    //        where: { 'channels': 'default'},
    //        data: data
    //    }, {
    //        success: function (obj) {
    //            console.log(MODULE_NAME + ': push notifications for object [' + (linkedId? linkedId:message) + '] SENT');
    //            onPushSend(null);
    //        },
    //        error: function (error) {
    //            console.error(MODULE_NAME + ': push notifications for object [' + (linkedId? linkedId:message) + '] ERROR', error);
    //            onPushSend(error);
    //        }
    //    });
    //}else{
    //    console.log(MODULE_NAME + ': push notification for object [' + (linkedId? linkedId:message) + '] SKIP for configuration');
    //    onPushSend(null);
    //}

 //}