/**
 * Created by Aureliano on 21/09/2015.
 * Operation that performs aggregate
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'AggregateOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _aggregate(funcParamObj, onExecuteComplete) {

  /** default object content of an operation */
  var operationObj = funcParamObj.operationRef;

  /** pre - operations on data */
  var collection = operationObj.conf['params.collection'];
  var pipelineField = operationObj.conf['params.pipeline'] ? operationObj.conf['params.pipeline'] : 'pipeline'; // which payload field is used as a pipeline (should be an array)
  var options = JSON.parse(operationObj.conf['params.options']); // aggregate options
  var payloadfieldinsert = operationObj.conf['params.payload.field.insert']; // insert the result in specific field
  var skipPipelineDel = operationObj.conf['params.pipeline.skipdelete'];

  /** get the pipeline */
  var pipeline = funcParamObj.payload[pipelineField];

  /** run the aggregate */
  _getRunQueryService().runAggregate(
    collection,
    pipeline,
    options,
    function onComplete(error, values) {
      if (!error && values) {
        if (payloadfieldinsert) {
          funcParamObj.payload[payloadfieldinsert] = values;
          if (!skipPipelineDel) {
            delete funcParamObj.payload[pipelineField];
          }
        } else {
          funcParamObj.payload = values;
        }
      } else {
        funcParamObj.payload = JSON.stringify(error);
      }
      onExecuteComplete(error, funcParamObj);
    }
  );
}

/**
 * private gettter for run query service
 * @returns {*}
 * @private
 */
function _getRunQueryService() {
  return require('../objectfactory/ObjectFactory').runQueryService;
}

/** exports */
exports.aggregate = _aggregate;
exports.invoke = _aggregate;