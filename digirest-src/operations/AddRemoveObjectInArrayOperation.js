/**
 * Created by Aureliano on 29/01/2016.
 * Operation that add a video to the user library
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'AddRemoveObjectInArrayOperation';


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _invoke(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;
  var data = funcParamObj.payload;

  try {

    var fieldFrom = operationObj.conf['params.field.from'];
    var operation = operationObj.conf['params.op'];
    var fieldOp = operationObj.conf['params.field.op'];
    var fieldTo = operationObj.conf['params.field.to'];


    // data.fieldTo = {$operation : {fieldOp : fieldFrom}}

    var opObject = {};
    var inner = {};
    inner[fieldOp] = data[fieldFrom];
    opObject['$' + operation] = inner;
    data[fieldTo] = opObject;
    funcParamObj.payload = data;
    onExecuteComplete(null, funcParamObj);

  } catch (error) {

    /** dispatch the error to the next op in chain */
    onExecuteComplete(error, funcParamObj);
  }
}


/** exports */
exports.invoke = _invoke;