/**
 * Service for PARSE
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ParseService';
var Parse = require('parse/node');
Parse.initialize(process.env.PARSE_APPID, process.env.PARSE_JSKEY, process.env.PARSE_MASTERKEY);
/**
 * track to parse analytic
 * @param key
 * @param object
 * @private
 */
function _trackAnalytics(key,object){
    Parse.Analytics.track(key,object).then(function(results){
        //console.log('PARSE============== '+ JSON.stringify(results));
        // do nothing
    },function(err){
        console.log(MODULE_NAME + " error: " + err.message);
    });
}
/**
 *
 * @param channel
 * @param message
 * @param linkedId
 * @param onPushSend
 * @private
 */
function _sendPushNotification(channel,message,linkedId,onPushSend) {
    if(process.env.PUSH_ENABLED==true || process.env.PUSH_ENABLED=='true') {
        // set up query
        //var query = new Parse.Query(Parse.Installation);
        //query.equalTo('notifEnabled', true);
        // set up channel
        var channelArray = [];
        channelArray[0] = channel;
        //query.equalTo('channels',channelArray);
        // set up data
        var data;
        if(linkedId) {
            data = {
                alert: message,
                objectId: linkedId,
                badge: '1',
                sound: "default"
            };
        }else{
            data = {
                alert: message,
                badge: '1',
                sound: "default"
            };
        }
        // send push
        Parse.Push.send({
            //where: {'notifEnabled': "true", 'channels': channel},
            where: { 'channels': 'default'},
            data: data
        }, {
            success: function (obj) {
                console.log(MODULE_NAME + ': push notifications for object [' + (linkedId? linkedId:message) + '] SENT');
                onPushSend(null);
            },
            error: function (error) {
                console.error(MODULE_NAME + ': push notifications for object [' + (linkedId? linkedId:message) + '] ERROR', error);
                onPushSend(error);
            }
        });
    }else{
        console.log(MODULE_NAME + ': push notification for object [' + (linkedId? linkedId:message) + '] SKIP for configuration');
        onPushSend(null);
    }
}


/** Exports */
exports.trackAnalytics=_trackAnalytics;
exports.sendPushNotification=_sendPushNotification;