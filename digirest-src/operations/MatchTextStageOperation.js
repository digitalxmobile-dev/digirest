/**
 * Created by Aureliano on 28/01/2016.
 * This file put a match stage for text search in the operation (better if first)
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'MatchTextStageOperation';
const underscore = require('underscore');


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _addStage(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    let operationObj = funcParamObj.operationRef;
    let data = funcParamObj.payload;

    /** operation configuration */
    let pipelineFieldName = operationObj.conf['params.payload.pipelinename'] ? operationObj.conf['params.payload.pipelinename'] : 'pipeline';
    let text = operationObj.conf['params.text'];
    let additionalParams = operationObj.conf['params.query.fields']?operationObj.conf['params.query.fields'].split(','):[];
    let regexField = operationObj.conf['params.regex'];

    try {

        // containers
        let pipelineArray = data[pipelineFieldName];
        let matchStage = {};
        matchStage['$match'] = {};
        let parameter = {};


        // create match stage
        for(let par of additionalParams){
            // condStage[par] = data[par];
            matchStage['$match'][par] = data[par];
        }

        if(!regexField) {
            matchStage['$match']['$text'] = {'$search': data[text]};
        }else{
            var reg = new RegExp(data[text], 'i');
            matchStage['$match']['$or']=[{},{}];
            matchStage['$match']['$or'][0][regexField] = {'$regex':reg};
            matchStage['$match']['$or'][1]['$text'] = {'$search':data[text]};
        }
        
        // build up togheter
        if(!pipelineArray){
            pipelineArray=[];
        }
        pipelineArray[pipelineArray.length]=matchStage;
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
exports.invoke=_addStage;
