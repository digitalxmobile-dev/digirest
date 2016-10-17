/**
 * Created by Aureliano on 17/09/2015.
 * This file is a simple  operation that add a fixed value to the payload
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'FixedValueOperation';
var REPLACE_HOLDER = '$$REPLACE$$';
var NOW_HOLDER = '$currentDate';
var H24_HOLDER = '$h24';

var AdvancedString = require('string');
var underscore = require('underscore');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _setVal(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var data = funcParamObj.payload;

  var fixedvalueStr = funcParamObj.operationRef.conf['params.values'];
  var arrayObject = funcParamObj.operationRef.conf['params.value.array'];

  /** prepare the function to invoke at the end of operation */
  var functionComplete = function (error, value) {

    /** if is a callback from a placeholder invokation, replace */
    if (value && !error && fixedvalueStr.indexOf(REPLACE_HOLDER) != -1) {
      var stringObj = AdvancedString(fixedvalueStr);
      stringObj = stringObj.replaceAll(REPLACE_HOLDER, value);
      fixedvalueStr = stringObj.toString();
    }

    /** add data to payload */
    var fixedValues = JSON.parse(fixedvalueStr);
    for (var valueKey in fixedValues) {
      if (fixedValues[valueKey] == NOW_HOLDER) {
        fixedValues[valueKey] = new Date();
      } else if (fixedValues[valueKey] == H24_HOLDER) {
        fixedValues[valueKey] = {
          '$lt': new Date(),
          '$gte': new Date(new Date().setDate(new Date().getDate() - 1))
        };

      }
      ;

      if (!arrayObject) {
        // set data to payload
        data[valueKey] = fixedValues[valueKey];
      } else {
        // set data to array
        data[arrayObject] = underscore.map(
          data[arrayObject],
          function initAll(obj) {
            obj[valueKey] = fixedValues[valueKey];
            return obj;
          });
      }
    }

    /** go on with next operation */
    funcParamObj.payload = data;
    onExecuteComplete(null, funcParamObj);
  };

  /** replace and eval the placeholders */
  if (fixedvalueStr.indexOf('$$') != -1) {
    var stringSplits = fixedvalueStr.split('$$');
    /*   {"fieldname" : "$$placeholder$$" }
     *   splits=['{"fieldname" : "','placeholder','"}']
     */
    if (stringSplits && stringSplits.length == 3) {
      fixedvalueStr = stringSplits[0] + '$$REPLACE$$' + stringSplits[2];
      var placeHolder = stringSplits[1].split('.');
      // get the module
      var module = require('../objectfactory/ObjectFactory')[placeHolder[0]];
      // invoke the function
      module[placeHolder[1]](functionComplete)

    }
  } else {
    functionComplete(null, null);
  }

}

/** exports */
exports.setval = _setVal;
exports.invoke = _setVal;
