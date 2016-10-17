/**
 * Created by Aureliano on 23/09/2015.
 * This file put a match stage in the operation (better if first)
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'MatchStageOperation';
var underscore = require('underscore');


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
    var qualifications = operationObj.conf['params.qualifications'].split(',');
    
    // containers
    var pipelineArray = data[pipelineFieldName];
    var matchStage = {};
    var query = {};

    // create the query
    for(var i=0; i<qualifications.length; i++){
        var fieldName = qualifications[i];
        if ((typeof data[fieldName] != 'undefined' )&&(data[fieldName]!=null)){
            if(underscore.isArray(data[fieldName])){
                query[fieldName] = {'$in':data[fieldName]};
            }else {
                query[fieldName] = data[fieldName];
            }
        }
    }

    // create the stage
    matchStage['$match']=query;

    // build up togheter
    if(!pipelineArray){
        pipelineArray=[];
    }
    pipelineArray[pipelineArray.length]=matchStage;
    data[pipelineFieldName]=pipelineArray;

    /** callback with funcParamObj updated - maybe */
    funcParamObj.payload = data;
    onExecuteComplete(null, funcParamObj);


}

/** exports */
exports.addStage=_addStage;
exports.invoke=_addStage;