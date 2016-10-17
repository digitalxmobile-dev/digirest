/**
 * Created by Aureliano on 04/11/2015.
 *
 * This file manage the security side of the API
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SecurityService';
var ConfigurationService = require('../objectfactory/ObjectFactory').configurationService;
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var SocialLoginService = require('../objectfactory/ObjectFactory').socialLoginService;
var secretConfig = require('./SecretConfig');
var jwt = require('jsonwebtoken');
var async = require('async');
var util = require('util');

/** standard auth params */
var QUERY_PROP_KEY = "app.security.%s.auth.query";
var QUERY_PROP_COLLECTION_KEY = "app.security.%s.auth.collection";
var AUTH_CHECK_FIELD = "app.security.%s.auth.fields";
var AUTH_DEFAULT_PRIVILEGE = "app.security.%s.auth.privilege";
var QUERY_FB_UPDATE_OBJ_PROP_KEY = "app.security.%s.auth.fb.update.object";
var QUERY_FB_UPDATE_QUERY_PROP_KEY = "app.security.%s.auth.fb.update.query";


/**
 * Authorize user on system
 * @param req
 * @param expire
 * @param loginkey
 * @param onAuth
 * @private
 */
function _authUser(req,expire,loginkey,onAuth){
    var queryObj;
    var userObj;
    async.waterfall([
            // get the fields
            function getCheckFields(callback){
                var propertyKey = util.format(AUTH_CHECK_FIELD,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // check the fields
            function checkFields(value,callback){
                if(value){
                    var fields = value.split(',');
                    for(var i=0; i<fields.length; i++){
                        if(!req.body[fields[i]]){
                            _debug(MODULE_NAME + ': ERROR login DENIED not all mandatory field have value');
                            callback(new Error("401"));
                        }else{
                            console.log(MODULE_NAME + ': field [' + fields[i] + ']ok-val[' + req.body[fields[i]] + ']');
                        }
                    }
                }
                callback();
            },
            // get the query
            function getProp(callback){
                var propertyKey = util.format(QUERY_PROP_KEY,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // get the collection name
            function getCollection(query, callback){
                if(!query){
                    throw new Error(MODULE_NAME + " Query LOGIN not DEFINED");
                }
                queryObj = eval("(" + query + ")" );

                var propertyKey = util.format(QUERY_PROP_COLLECTION_KEY,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // execute the query
            function getUser(collection, callback){
                _getObjectService().getObjectByQualification(queryObj,collection,callback);
            },
            // get the default privilege
            function getDefaultPrivilege(user,callback) {
                if (user) {
                    userObj = user;
                    var propertyKey = util.format(AUTH_DEFAULT_PRIVILEGE,loginkey);
                    _getConfigurationService().getProperty(propertyKey, callback);
                }else{
                    // no user = wrong access credential
                    _debug(MODULE_NAME + ': ERROR wrong login supplied [' + req.body.username + '][' + req.body.password + ']');
                    callback(new Error("401"));
                }
            },
            // create the token
            function authorize(privilege,callback){
                if(privilege){
                    userObj.cd_privilege = privilege;
                }

                userObj.pw_password = null;
                var token = _signToken(userObj, secretConfig.secret, expire);
                var outObj = {
                    success: true,
                    token: token,
                    user: userObj
                };
                callback(null,outObj);
            }],
        function onFinish(error,value){
            onAuth(error,value);
        }
    );
}

/**
 * Authorize user on system
 * @param req
 * @param expire
 * @param loginkey
 * @param onAuth
 * @private
 */
function _authFbUser(req,expire,loginkey,onAuth){
    var queryObj;
    var updateObj;
    var userObj;
    var fieldsReq;
    async.waterfall([
            // get the fields
            function getCheckFields(callback){
                var propertyKey = util.format(AUTH_CHECK_FIELD,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // check the fields
            function checkFields(value,callback){
                if(value){
                    var fields = value.split(',');
                    fieldsReq = fields;
                    for(var i=0; i<fields.length; i++){
                        if(!req.body[fields[i]]){
                            _debug(MODULE_NAME + ': ERROR login DENIED not all mandatory field have value');
                            callback(new Error("401"));
                        }else{
                            console.log(MODULE_NAME + ': field [' + fields[i] + ']ok-val[' + req.body[fields[i]] + ']');
                        }
                    }
                }
                callback();
            },
            function checkFb(callback){
                _getSocialLoginService().validateFacebookLogin(
                    req.body[fieldsReq[0]],
                    req.body[fieldsReq[1]],
                    callback
                );
                //callback(null,null);
            },
            // get the updateObject
            function getProp1(result, callback){
                if(!result || !result.success){
                    // no user = wrong access credential
                    _debug(MODULE_NAME + ': ERROR wrong login supplied [' + req.body.username + '][' + req.body.password + ']');
                    callback(new Error("401"),null);
                }else {
                    var propertyKey = util.format(QUERY_FB_UPDATE_OBJ_PROP_KEY, loginkey);
                    _getConfigurationService().getProperty(propertyKey, callback);
                }
            },
            // get the query
            function getProp2(value,callback){
                if(!value){
                    throw new Error(MODULE_NAME + " Facebook LOGIN query update NOT DEFINED");
                }
                updateObj = eval("(" + value + ")");
                var propertyKey = util.format(QUERY_FB_UPDATE_QUERY_PROP_KEY,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // get the collection name
            function getCollection(query, callback){
                if(!query){
                    throw new Error(MODULE_NAME + " Query LOGIN not DEFINED");
                }
                queryObj = eval("(" + query + ")" );

                var propertyKey = util.format(QUERY_PROP_COLLECTION_KEY,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // execute the query
            function updateUser(collection, callback){
                _getObjectService().updateObject(
                    queryObj,
                    collection,
                    updateObj,
                    {},
                    callback);
            },
            // get the default privilege
            function getDefaultPrivilege(res,callback) {
                if (res && res.value) {
                    userObj = res.value;
                    userObj.pw_password = null;
                    var propertyKey = util.format(AUTH_DEFAULT_PRIVILEGE,loginkey);
                    _getConfigurationService().getProperty(propertyKey, callback);
                }else{
                    // no user = wrong access credential
                    _debug(MODULE_NAME + ': ERROR wrong login supplied [' + req.body.username + '][' + req.body.password + ']');
                    callback(new Error("401"));
                }
            },
            // create the token
            function authorize(privilege,callback){
                if(privilege){
                    userObj.cd_privilege = privilege;
                }

                userObj.pw_password = null;
                var token = _signToken(userObj, secretConfig.secret, expire);
                var outObj = {
                    success: true,
                    token: token,
                    user: userObj
                };
                callback(null,outObj);
            }],
        function onFinish(error,value){
            onAuth(error,value);
        }
    );
}
/**
 * Authorize user on system
 * @param req
 * @param expire
 * @param loginkey
 * @param onAuth
 * @private
 */
function _authGoogleUser(req,expire,loginkey,onAuth){
    var queryObj;
    var updateObj;
    var userObj;
    var fieldsReq;
    async.waterfall([
            // get the fields
            function getCheckFields(callback){
                var propertyKey = util.format(AUTH_CHECK_FIELD,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // check the fields
            function checkFields(value,callback){
                if(value){
                    var fields = value.split(',');
                    fieldsReq = fields;
                    for(var i=0; i<fields.length; i++){
                        if(!req.body[fields[i]]){
                            _debug(MODULE_NAME + ': ERROR login DENIED not all mandatory field have value');
                            callback(new Error("401"));
                        }else{
                            console.log(MODULE_NAME + ': field [' + fields[i] + ']ok-val[' + req.body[fields[i]] + ']');
                        }
                    }
                }
                callback();
            },
            function checkFb(callback){
                _getSocialLoginService().validateGoogleLogin(
                    req.body[fieldsReq[0]],
                    req.body[fieldsReq[1]],
                    callback
                );
                //callback(null,null);
            },
            // get the updateObject
            function getProp1(result, callback){
                if(!result || !result.success){
                    // no user = wrong access credential
                    _debug(MODULE_NAME + ': ERROR wrong login supplied [' + req.body.username + '][' + req.body.password + ']');
                    callback(new Error("401"),null);
                }else {
                    var propertyKey = util.format(QUERY_FB_UPDATE_OBJ_PROP_KEY, loginkey);
                    _getConfigurationService().getProperty(propertyKey, callback);
                }
            },
            // get the query
            function getProp2(value,callback){
                if(!value){
                    throw new Error(MODULE_NAME + " Facebook LOGIN query update NOT DEFINED");
                }
                updateObj = eval("(" + value + ")");
                var propertyKey = util.format(QUERY_FB_UPDATE_QUERY_PROP_KEY,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // get the collection name
            function getCollection(query, callback){
                if(!query){
                    throw new Error(MODULE_NAME + " Query LOGIN not DEFINED");
                }
                queryObj = eval("(" + query + ")" );

                var propertyKey = util.format(QUERY_PROP_COLLECTION_KEY,loginkey);
                _getConfigurationService().getProperty(propertyKey, callback);
            },
            // execute the query
            function updateUser(collection, callback){
                _getObjectService().updateObject(
                    queryObj,
                    collection,
                    updateObj,
                    {},
                    callback);
            },
            // get the default privilege
            function getDefaultPrivilege(res,callback) {
                if (res && res.value) {
                    userObj = res.value;
                    userObj.pw_password = null;
                    var propertyKey = util.format(AUTH_DEFAULT_PRIVILEGE,loginkey);
                    _getConfigurationService().getProperty(propertyKey, callback);
                }else{
                    // no user = wrong access credential
                    _debug(MODULE_NAME + ': ERROR wrong login supplied [' + req.body.username + '][' + req.body.password + ']');
                    callback(new Error("401"));
                }
            },
            // create the token
            function authorize(privilege,callback){
                if(privilege){
                    userObj.cd_privilege = privilege;
                }

                userObj.pw_password = null;
                var token = _signToken(userObj, secretConfig.secret, expire);
                var outObj = {
                    success: true,
                    token: token,
                    user: userObj
                };
                callback(null,outObj);
            }],
        function onFinish(error,value){
            onAuth(error,value);
        }
    );
}
/**
 * verify token agains jwt
 * @param token
 * @param onVerify
 * @private
 */
function _verifyToken(token,onVerify){
    jwt.verify(
        token,
        secretConfig.secret,
        onVerify
    );
}

/**
 * sign the token with jwt
 * @param payload
 * @param secret
 * @private
 */
function _signToken(payload,secret,expire){
    var options = {};
    if(expire){
        options.expiresIn=expire;
    }
    if(!secret){
        secret = require('./SecretConfig').secret;
    }
    var token = jwt.sign( payload,secret,options);
    return token;
}

/**
 * return the admin token
 * @returns {*}
 * @private
 */
function _getAdminToken(){
    var options = {};
    options.expiresIn='1h';
    var secret = require('./SecretConfig').secret;
    var token = jwt.sign( {cd_privilege:'CMS-ACCESS-ADMIN'},secret,options);
    return token;
}

/**
 * getter for configuration service
 * @returns {*}
 * @private
 */
function _getConfigurationService(){
    if(!ConfigurationService){
        ConfigurationService = require('../objectfactory/ObjectFactory').configurationService;
    }
    return ConfigurationService;
}

/**
 * getter for objectservice
 * @returns {*}
 * @private
 */
function _getObjectService(){
    if(!ObjectService){
        ObjectService = require('../objectfactory/ObjectFactory').objectService;
    }
    return ObjectService;
}

/**
 * getter for SocialLoginService
 * @returns {*}
 * @private
 */
function _getSocialLoginService(){
    if(!SocialLoginService){
        SocialLoginService = require('../objectfactory/ObjectFactory').socialLoginService;
    }
    return SocialLoginService;
}


function _debug(message){
    console.log(util.inspect(message,{colors:true}));
}

/** Exports **/
exports.verifyToken=_verifyToken;
exports.signToken=_signToken;
exports.authUser=_authUser;
exports.authFbUser= _authFbUser;
exports.authGoogleUser=_authGoogleUser;
exports.getAdminToken=_getAdminToken;