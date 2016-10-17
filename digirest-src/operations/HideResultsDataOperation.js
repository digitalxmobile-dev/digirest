/**
 * Created by Aureliano on 01/07/2015.
 * delete some object from payload
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'HideResultsDataOperation';
const underscore = require('underscore');


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _clear(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  let operationObj = funcParamObj.operationRef;
  let data = funcParamObj.payload;

  /** operation configuration */
  let fieldsName = operationObj.conf['params.fields'].split(',');

    funcParamObj.payload = underscore.map(
      data,
      function filter(row) {
        return underscore.mapObject(
          row,
          function (value, field) {
            if (underscore.find(fieldsName, function (f) {
                return f === field
              })) {
              return null;
            } else {
              return value;
            }
          });
      }
    );

    onExecuteComplete(null, funcParamObj);


}

/** exports */
exports._clear = _clear;
exports.invoke = _clear;
