/**
 * Created by Aureliano on 17809/2015.
 * This operation increment a field
 * TODO FIXME style
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'IncrementOperation';
var ObjectService = require('../objectfactory/ObjectFactory').objectService;


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _increment(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var httpRequest = funcParamObj.request;
  var httpResponse = funcParamObj.response;
  var data = funcParamObj.payload;

  /** pre - operations on data */
  var collection = operationObj.conf['params.collection'];
  var incrementField = operationObj.conf['params.query.increment.field'];
  var incrementValue = operationObj.conf['params.query.increment.value'];
  var responseAsPayload = operationObj.conf['params.payload.response'];
  var qualificationsFrom = operationObj.conf['params.query.qualification.from'].split(',');
  /** get the columns to be qualified, if any*/
  var qualificationsTo = operationObj.conf['params.query.qualification.to'];
  if (qualificationsTo)qualificationsTo = qualificationsTo.split(',');

  /** set up the qualification obj */
  var objQualification = {};
  for (var i = 0; i < qualificationsFrom.length; i++) {
    var fieldName = qualificationsFrom[i];
    if (qualificationsTo && qualificationsTo[i] == '_id') {
      // if the column is an id
      objQualification[qualificationsTo[i]] = _getObjectService().getObjectID(data[fieldName]);
    } else if (qualificationsTo) {
      // if there is a qualification
      objQualification[qualificationsTo[i]] = data[fieldName];
    } else {
      // if there isn't any qualification
      objQualification[fieldName] = data[fieldName];
    }
  }

  /** prepare update payload */
  var objSet = {};
  objSet['timeInfo.dt_lastUpdated'] = new Date();
  var objInc = {};
  objInc[incrementField] = incrementValue;
  var objUpdate = {};
  objUpdate['$set'] = objSet;
  objUpdate['$inc'] = objInc;

  console.log(MODULE_NAME + ": qualification [" + JSON.stringify(objQualification) + ']');
  console.log(MODULE_NAME + ": update payload [" + JSON.stringify(objUpdate) + ']');


  try {

    /** try the update */
    _getObjectService().updateObject(
      objQualification,
      collection,
      objUpdate,
      null,
      function onComplete(error, obj) {
        // if found, ok
        if (obj && obj.value && !error) {
          if (responseAsPayload) {
            funcParamObj.payload = obj.value;
          }
          // FIXME obj.value contiene l'oggetto prima dell'update
          console.log(MODULE_NAME + ": update ok [" + JSON.stringify(obj) + ']');
          onExecuteComplete(null, funcParamObj);
        } else {
          onExecuteComplete(error, funcParamObj);
        }
      });

  } catch (error) {

    /** dispatch the error to the next op in chain */
    onExecuteComplete(error, funcParamObj);

  }
}

/**
 * return the run queryservice
 * @returns {*}
 * @private
 */
function _getObjectService() {
  if (!ObjectService) {
    ObjectService = require('../objectfactory/ObjectFactory').objectService;
  } else {
    return ObjectService;
  }
}

/** exports */
exports.increment = _increment;
exports.invoke = _increment;