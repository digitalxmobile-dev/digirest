/**
 * Created by Aureliano on 18/03/2016.
 * Service for social login
 */
var MODULE_NAME = 'SocialLoginService';
var FACEBOOK_API = process.env.FACEBOOK_API || 'graph.facebook.com';
var FACEBOOK_ROUTE = process.env.FACEBOOK_ROUTE || '/v2.5/me';
var GOOGLE_API = process.env.GOOGLE_API || 'www.googleapis.com';
var GOOGLE_ROUTE = process.env.GOOGLE_ROUTE || '/oauth2/v3/tokeninfo';
var GET_METHOD = 'GET';
var POST_METHOD = 'POST';
var PUT_METHOD = 'PUT';
var ErrorService = require('../objectfactory/ObjectFactory').errorService;
var https = require('https');
var util = require('util');
var request = require('request');


/**
 * validate the facebook login token received
 * @param email
 * @param token
 * @param onValidate
 * @private
 */
function _validateFacebookLogin(email,token,onValidate){
    var route = FACEBOOK_ROUTE + '?access_token=' + token + '&fields=email';
    _invokeRouteHttps(
        null,
        route,
        null,
        FACEBOOK_API,
        GET_METHOD,
        {},
        function onGetData(err,val){
            if(!err && val.email && val.email==email){
                onValidate(null,{success:true});
            }else{
                onValidate(err,{success:false});
            }
        }
    );
}

/**
 * validate the facebook login token received
 * @param email
 * @param token
 * @param onValidate
 * @private
 */
function _validateGoogleLogin(email,token,onValidate){
    var route = GOOGLE_ROUTE + '?id_token=' + token;
    _invokeRouteHttps(
        null,
        route,
        null,
        GOOGLE_API,
        GET_METHOD,
        {},
        function onGetData(err,val){
            if(!err && val.email && val.email==email){
                onValidate(null,{success:true});
            }else{
                onValidate(err,{success:false});
            }
        }
    );
}

/**
 * invoke the route
 * @param objectOrder
 * @param route
 * @param token
 * @param callback
 */
function _invokeRouteHttps(dataRequest, route, token, host, method,headers,callback) {
    var callbackInvoked = false;
    try {

        var data = dataRequest;

        var options = {
            'hostname': host,
            'port': 443,
            'path': route,
            'method': method
            //,'headers': {
            //    'x-access-token': token,
            //    'Content-Type': 'application/json'
            //}
        }

        console.log(MODULE_NAME + ': Invoking ' + host + route);
        var timingKey = MODULE_NAME + Math.random()
        console.time(timingKey);
        //callback(null,null);

        var req = https.request(options, function (res) {
            console.timeEnd(timingKey);
            console.log(MODULE_NAME + ': statusCode: %s', res.statusCode);
            console.log(MODULE_NAME + ': headers: %s', JSON.stringify(res.headers));
            var body = '';


            res.setEncoding('UTF8');

            if (res.statusCode != 200) {
                _getErrorService().traceError({res:util.inspect(res)}, MODULE_NAME);
                //callback(new Error(res.statusCode + ' ' + res.header),{success:false});
            }

            res.on('data', function (data) {
                body += data;

                // Too much POST data, kill the connection!
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6) {
                    req.connection.destroy();
                }
            });

            res.on('error', function (e) {
                console.error(e);
                if (!callbackInvoked) {
                    callback(e, {success: false});
                    callbackInvoked = true;
                }
                _getErrorService().traceError(e, MODULE_NAME);
                // break the execution
                throw e;
            });

            res.on('end', function () {
                var postData = JSON.parse(body);
                callback(null,postData);
            });

        });


        req.on('error', function (e) {
            console.error(e);
            if (!callbackInvoked) {
                callback(e, {success: false});
                callbackInvoked = true;
            }
            _getErrorService().traceError(e, MODULE_NAME);
            // break the execution
            throw e;
        });


        if(method===POST_METHOD ||method===PUT_METHOD) {
            req.write(JSON.stringify(data));
        }
        req.end();
        req = null;

    }catch(error){
        console.error(error);
        console.log(MODULE_NAME + ': error IGNORED by server on SocialLoginService');
        if(!callbackInvoked){
            callbackInvoked = true;
            callback(error,null);
        }
    }
}

/**
 * private getter for the error service
 * @returns {*}
 * @private
 */
function _getErrorService(){
    if(!ErrorService) {
        ErrorService = require('../objectFactory/ObjectFactory').errorService;
    }
    return ErrorService;
}


/** Exports */
exports.validateFacebookLogin=_validateFacebookLogin;
exports.validateGoogleLogin=_validateGoogleLogin;