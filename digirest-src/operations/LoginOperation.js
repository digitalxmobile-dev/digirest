/**
 * Created by Aureliano on 21/09/2015.
 * Operation that performs login with security service
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'LoginOperation';
var SecurityService = require('../objectfactory/ObjectFactory').securityService;

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _login(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;

    /** get expire difference */
    var expire = operationObj.conf['params.expire'];
    var loginKey = operationObj.conf['params.loginkey'];

    try {

        if(httpRequest.body && JSON.stringify(httpRequest.body)!='{}') {

            if(funcParamObj.payload.facebook) {
                _getSecurityService().authFbUser(
                    httpRequest,
                    expire,
                    loginKey,
                    function onAuth(error, payload) {
                        funcParamObj.payload = payload;
                        if (error) {
                            if (error.message == '401') {
                                httpResponse.status(401);
                            }
                        }
                        onExecuteComplete(error, funcParamObj);
                    });
            }else if(funcParamObj.payload.google){
                _getSecurityService().authGoogleUser(
                    httpRequest,
                    expire,
                    loginKey,
                    function onAuth(error, payload) {
                        funcParamObj.payload = payload;
                        if (error) {
                            if (error.message == '401') {
                                httpResponse.status(401);
                            }
                        }
                        onExecuteComplete(error, funcParamObj);
                    });
            }else {
                _getSecurityService().authUser(
                    httpRequest,
                    expire,
                    loginKey,
                    function onAuth(error, payload) {
                        funcParamObj.payload = payload;
                        if (error) {
                            if (error.message == '401') {
                                httpResponse.status(401);
                            }
                        }
                        onExecuteComplete(error, funcParamObj);
                    });
            }
        }else{
            httpResponse.status(401);
            onExecuteComplete(new Error('401'), funcParamObj);
        }

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}

/**
 * private gettter for run query service
 * @returns {*}
 * @private
 */
function _getSecurityService(){
    if(!SecurityService){
        SecurityService = require('../objectfactory/ObjectFactory').securityService;
    }
    return SecurityService;
}

/** exports */
exports.login=_login;
exports.invoke=_login;
