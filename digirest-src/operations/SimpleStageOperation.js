/**
 * Created by Aureliano on 17/11/2015.
 * This file put a parametric stage in the operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SimpleStageOperation';



/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _addStage(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** operation configuration */
    var pipelineFieldName = operationObj.conf['params.payload.pipelinename'];
    var stageDefinition = operationObj.conf['params.stage.definition'];

    try {

        // containers
        var pipelineArray = data[pipelineFieldName];
        var stage = JSON.parse(stageDefinition);

        // build up togheter
        if(!pipelineArray){
            pipelineArray=[];
        }
        pipelineArray[pipelineArray.length]=stage;
        data[pipelineFieldName]=pipelineArray;

        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports.addStage=_addStage;
