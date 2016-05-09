/**
 * This file manage the mongo connection
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'MongoConnectionService';
var MONGO_PREFIX = 'mongodb';
var URL_PATTERN= '%s://%s:%s@%s:%s/%s';
//var ConfigurationService = require('../configurationservice/BasicConfigurationService');
var ConfigurationService = require('../objectFactory/ObjectFactory').configurationService;
var Logger = require('../objectFactory/ObjectFactory').Logger;
var MongoClient = require('mongodb').MongoClient;
var util = require('util');
var mongoConfiguration;
var urlConnection;


/**
 * get the db connection
 * @param onConnected
 * @private
 */
function _getConnection(onConnected){
    if(mongoConfiguration) {
        MongoClient.connect(urlConnection, function (error, db) {
            if (db) {
                console.log(MODULE_NAME + ': connected correctly to server. ');
                //Logger.info(MODULE_NAME + ': connected correctly to server. ');
                onConnected(null,db);
            } else {
                onConnected(error,null);
            }
        });
    }else{
        Logger.error(MODULE_NAME + ': was expecting to be a SINGLETON. app is working weird. SINGLETON not available');
    }
}

/**
 * Test the connection
 * @param onConnected
 * @private
 */
function _testConnection(onConnected) {
    if(mongoConfiguration) {
        MongoClient.connect(urlConnection, function (err, db) {
            if (db) {
                console.log(MODULE_NAME + ': Connected correctly to server.');
                db.close();
                onConnected(null);
            } else {
                console.log(MODULE_NAME + ': error correctly to server. ' + JSON.stringify(err));
                //Logger.info(MODULE_NAME + ': error correctly to server. ' + JSON.stringify(err));
                onConnected(err);
            }
        });
    }else{
        _loadConfiguration(
            function onloaded(error,valueObj){
                if(valueObj){
                    // recursive call
                    // TODO verify fails
                    console.log(MODULE_NAME + ': mongo configuration loaded');
                    _testConnection(onConnected);
                }else{
                    console.log(MODULE_NAME + ': error loading mongo configuration ' + JSON.stringify(error));
                    onConnected(error);
                }
            });
    }
}

/**
 * load mongo connection properties
 * @param onLoaded
 * @private
 */
function _loadConfiguration(onLoaded){
    ConfigurationService.getPropertiesJsonByRoot(
        MONGO_PREFIX,
        function onComplete(error,valueObj) {
            if(valueObj){
                // only console logging available here
                console.log(MODULE_NAME + ': _loadConfiguration obj[' + JSON.stringify(valueObj) + ']');
                mongoConfiguration = valueObj;
                urlConnection = _formatUrl();
                onLoaded(null,valueObj);
            }else{
                onLoaded(error,null);
            }
        });
}

/**
 * format the url for the db connection
 * @returns the formatted url
 * @private
 */
function _formatUrl(){

    // try override all
    if(process.env.MONGO_CONN){
        return process.env.MONGO_CONN;
    }

    // override configuration db name
    if(process.env.DB_NAME){
        mongoConfiguration.database = process.env.DB_NAME;
    }

    var url =  util.format(URL_PATTERN,
        mongoConfiguration.protocol,
        mongoConfiguration.user,
        mongoConfiguration.pwd,
        mongoConfiguration.host,
        mongoConfiguration.port,
        mongoConfiguration.database);
    urlConnection = url;
    console.log(MODULE_NAME + ': connection url ' + urlConnection);
    return urlConnection;
}

/** Exports */
exports.testConnection=_testConnection;
exports.getConnection=_getConnection;
