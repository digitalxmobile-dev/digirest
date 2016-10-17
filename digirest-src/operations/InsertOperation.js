/**
 * Created by Aureliano on 19/11/2015.
 * This operation insert a new object
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'InsertOperation';
const ObjectService = require('../objectfactory/ObjectFactory').objectService;
const async = require('async');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _insert(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  let operationObj = funcParamObj.operationRef;
  let httpResponse = funcParamObj.response;
  let data = funcParamObj.payload;

  /** pre - operations on data */
  let collection = operationObj.conf['params.collection'];
  let newObjectField = operationObj.conf['params.payload.newobject'];
  let qualifications = (operationObj.conf['params.query.qualification']) ? (operationObj.conf['params.query.qualification']).split(',') : null;
  let lockPayload = operationObj.conf['params.payload.lock'];
  let fieldDest = operationObj.conf['params.dest.field'];
  let objQualification = {};
  let objInsert = {};

  /** set up the qualification obj, if required, else skip the verification step */
  if (qualifications) {
    for (let i = 0; i < qualifications.length; i++) {
      let fieldName = qualifications[i];
      objQualification[fieldName] = data[fieldName];
      if (!objQualification[fieldName]) {
        httpResponse.sendStatus(400);
        httpResponse.send();
        return;
      }
    }
    console.log(MODULE_NAME + ": qualification [" + JSON.stringify(objQualification) + ']');
  }

  /** get the new object, if defined a field */
  if (newObjectField) {
    objInsert = data[newObjectField];
  } else {
    objInsert = data;
  }

  /** verify and insert */
  async.waterfall([
      // if present a qualification, verify the new object
      function verifyInsert(callback) {
        if (qualifications && objQualification) {
          _getObjectService().getObjectByQualification(objQualification, collection, callback);
        } else {
          callback(null, null);
        }
      },
      // if return is empty, insert
      function insert(previousObject, callback) {
        // if already exists, raise an error
        if (previousObject) {
          httpResponse.status(409);
          callback(new Error('409'), null);
        } else {
          _getObjectService().insertObject(objInsert, collection, callback);
        }
      },
      // finalize
      function onOK(response, callback) {
        if (!lockPayload) {
          if (fieldDest) {
            funcParamObj.payload[fieldDest] = response;
          } else {
            funcParamObj.payload = response;
          }
        }
        onExecuteComplete(null, funcParamObj);
      }
    ],
    function onFinish(error, value) {
      if (error) {
        console.error((error));
      }
      onExecuteComplete(error, value);
    });

}


/**
 * return the run queryservice
 * @returns {*}
 * @private
 */
function _getObjectService() {
  return require('../objectfactory/ObjectFactory').objectService;
}

/** exports */
exports.insert = _insert;
exports.invoke = _insert;