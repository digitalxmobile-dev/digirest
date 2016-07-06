/**
 * Created by Aureliano on 28/01/2016.
 *
 * This file put a sort stage in the operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SortStageOperation';


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
    var pipelineFieldName = operationObj.conf['params.payload.pipelinename'] ? operationObj.conf['params.payload.pipelinename'] : 'pipeline';
    var sortFromConf = operationObj.conf['params.sort'] || operationObj.conf['params.sort.default'];
    var sortFromPayloadField = operationObj.conf['params.payload.sort.field'];
    var sortDirection = operationObj.conf['params.payload.sort.direction'];

    try {

        // containers
        var pipelineArray = data[pipelineFieldName];
        var sortStage = {};
        var sortSubStage = {};
        var sortValue = 1; // default ASC
        if(sortDirection && data[sortDirection] && data[sortDirection]==='DESC'){
            sortValue = -1;
        }

        // get projection
        if(sortFromPayloadField && data[sortFromPayloadField]){
            // explicit field with all projection
            sortSubStage[data[sortFromPayloadField]] = sortValue;
        }else if (sortFromConf){
            // configuration-time projection or default
            sortSubStage = JSON.parse(sortFromConf);
        }else{
            sortSubStage._id = sortValue;
        }

        // create the stage
        sortStage['$sort']=sortSubStage;

        // build up togheter
        if(!pipelineArray){
            pipelineArray=[];
        }
        pipelineArray[pipelineArray.length]=sortStage;
        data[pipelineFieldName]=pipelineArray;

        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
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
