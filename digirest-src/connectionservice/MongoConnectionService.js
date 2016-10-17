/**
 * This file manage the mongo connection
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'MongoConnectionService';
const MONGO_PREFIX = 'mongodb';
const URL_PATTERN = '%s://%s:%s@%s:%s/%s';
const ConfigurationService = require('../objectFactory/ObjectFactory').configurationService;
const MongoClient = require('mongodb').MongoClient;
const util = require('util');
var mongoConfiguration;
var urlConnection;


/**
 * get the db connection
 * @param onConnected
 * @private
 */
function _getConnection(onConnected) {
  if (mongoConfiguration) {
    MongoClient.connect(
      urlConnection,
      (error, db) => {
        if (db) console.log(MODULE_NAME + ': connected correctly to server. ');
        onConnected(error, db);
      }
    );
  } else {
    console.error(MODULE_NAME + ': was expecting to be a SINGLETON. app is working weird. SINGLETON not available');
  }
}

/**
 * Test the connection
 * @param onConnected
 * @private
 */
function _testConnection(onConnected) {
  if (mongoConfiguration) {
    MongoClient.connect(
      urlConnection,
      (err, db) => {
        if (db) {
          console.log(MODULE_NAME + ': Connected correctly to server.');
          db.close();
        } else {
          console.log(MODULE_NAME + ': error correctly to server. ' + JSON.stringify(err));
        }
        onConnected(err);
      });
  } else {
    _loadConfiguration(
      (error, valueObj) => {
        if (valueObj) {
          // recursive call
          console.log(MODULE_NAME + ': mongo configuration loaded');
          _testConnection(onConnected);
        } else {
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
function _loadConfiguration(onLoaded) {
  ConfigurationService.getPropertiesJsonByRoot(
    MONGO_PREFIX,
    (error, valueObj)=> {
      urlConnection = _formatUrl(valueObj);
      onLoaded(error, valueObj);
    });
}

/**
 * format the url for the db connection
 * @returns the formatted url
 * @private
 */
function _formatUrl(conf) {

  mongoConfiguration = conf;

  // try override all
  if (process.env.MONGO_CONN) {
    return process.env.MONGO_CONN;
  }

  // override configuration db name
  if (process.env.DB_NAME) {
    mongoConfiguration.database = process.env.DB_NAME;
  }

  var url = util.format(URL_PATTERN,
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
exports.testConnection = _testConnection;
exports.getConnection = _getConnection;
