/**
 * Created by Aureliano on 23/09/2015.
 * This file put a project stage in the operation
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'ProjectStageOperation';
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
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    /** operation configuration */
    var pipelineFieldName = operationObj.conf['params.payload.pipelinename'] ? operationObj.conf['params.payload.pipelinename'] : 'pipeline';
    var projectionFromConf = operationObj.conf['params.projection'];
    var projectionFromPayloadField = operationObj.conf['params.payload.projection.field'];
    var projectionFromPayloadArray = operationObj.conf['params.payload.projection.array'];

    // containers
    var pipelineArray = data[pipelineFieldName];
    var projectStage = {};
    var projectSubStage = {};
    // get projection
    if(projectionFromConf){
        // configuration-time projection
        projectSubStage = JSON.parse(projectionFromConf,__SpecialJsonParserReviver);
    }else if(projectionFromPayloadField){
        // explicit field with all projection
        projectSubStage = data[projectionFromPayloadField];
    }else if(projectionFromPayloadArray){
        // array of field names with projection
        var fieldArray = data[projectionFromPayloadArray];
        if(!underscore.isArray(fieldArray) && !underscore.isEmpty(fieldArray)){
            fieldArray = fieldArray.split(',');
        }
        for(var i in fieldArray){
            projectSubStage[fieldArray[i]] = true;
        }
    }
    if(!underscore.isEmpty(projectSubStage)) {
        // create the stage
        projectStage['$project'] = projectSubStage;
        // build up togheter
        if (!pipelineArray) {
            pipelineArray = [];
        }
        pipelineArray[pipelineArray.length] = projectStage;
        data[pipelineFieldName] = pipelineArray;
    }
    /** callback with funcParamObj updated - maybe */
    funcParamObj.payload = data;
    onExecuteComplete(null, funcParamObj);

    

}

/**
 * USed to define eval parameter: like $$$new Date()$$$ return the new date
 * @param k
 * @param v
 * @returns {*}
 * @private
 */
function __SpecialJsonParserReviver(k,v){
    if(v && Array.isArray(v)){
        for(var i=0; i< v.length; i++){
            if(v[i] && v[i].indexOf && v[i].indexOf('$$$')!=-1){
                var sl = v[i].split('$$$');
                v[i] = eval(sl[1]);
            }
        }
    }else if (v && v.indexOf && v.indexOf('$$$')!=-1){
        var sl = v.split('$$$');
        v = eval(sl[1]);
    }
    return v;
}

/** exports */
exports.addStage=_addStage;
exports.invoke=_addStage;
