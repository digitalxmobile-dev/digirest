/**
 * Created by Aureliano on 02/10/2015.
 * This operation conditionally swap the "NEXT operation with a selected one
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ConditionalChangeNextOperation';
var OpearationService = require('../objectfactory/ObjectFactory').operationService;
var util = require('util');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _evalCondition(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var data = funcParamObj.payload;

  /** pre - operations on data */
  var operationNameTrue = operationObj.conf['params.operation.whiletrue'];
  var operationNameFalse = operationObj.conf['params.operation.whilefalse'];
  var qualifications = operationObj.conf['params.condition.qualification'].split(',');
  var evalString = operationObj.conf['params.condition.evaluate'];


  /** set up the qualification obj */
  var evalObject = evalString;
  for (var i = 0; i < qualifications.length; i++) {
    var fieldName = qualifications[i];
    var value = data[fieldName];
    evalObject = util.format(evalObject, value);
  }

  try {

    var actualOp;
    /** eval the condition */
    var evaluation = eval(evalObject);

    /** change the operation, if required */
    if (evaluation && operationNameTrue) {
      actualOp = _changeItemInList(operationObj, operationNameTrue);
    } else if ((!evaluation) && operationNameFalse) {
      actualOp = _changeItemInList(operationObj, operationNameFalse);
    } else {
      actualOp = operationObj
    }

    /** link and go on */
    funcParamObj.operationRef = actualOp;
    onExecuteComplete(null, funcParamObj);


  } catch (error) {

    /** dispatch the error to the next op in chain */
    onExecuteComplete(error, funcParamObj);
  }
}

function _changeItemInList(operationObj, operationName) {
  // change of a elementin linked list
  var legacyNextOp = operationObj.next;                                           //LV n+1 - old
  var newNextOp = _getOperationService().getOperationByName(operationName);       //LV n+1 - new
  var actualOp = operationObj;                                                    //LV n
  var nextNextOp = legacyNextOp.next;                                             //LV n+2
  actualOp.next = newNextOp;                                                      //swap n+1 levels to n
  newNextOp.next = nextNextOp;                                                    //attach the new list tail (n+2)(n+3)
  return actualOp;
}

/**
 * private gettter for operation service
 * @returns {*}
 * @private
 */
function _getOperationService() {
  if (!OpearationService) {
    OpearationService = require('../objectfactory/ObjectFactory').operationService;
  }
  return OpearationService;
}

/** exports */
exports.evalCondition = _evalCondition;
