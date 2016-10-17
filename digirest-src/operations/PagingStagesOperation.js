/**
 * Created by Aureliano on 23/09/2015.
 * This op add paging to pipelines
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'PagingStagesOperation';
var DEFAULT_PAGESIZE = 50;
var DEFAULT_PAGENUM = 0;
var LIMIT_PAGESIZE=100;
var LIMIT_PAGENUM=100;

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
    var pageSizeField = operationObj.conf['params.payload.pageSize'];
    var pageNumField = operationObj.conf['params.payload.pageNum'];

    /** paging from payload */
    var pageSize = (pageSizeField)? data[pageSizeField] : operationObj.conf['params.payload.fixedPageSize'];
    var pageNum = (pageNumField)? data[pageNumField] : operationObj.conf['params.payload.fixedPageNum'];

    try {

        // containers
        var pipelineArray = data[pipelineFieldName];
        var skipStage = {};
        var limitStage = {};

        // default values
        if(!pageNum){
            pageNum=DEFAULT_PAGENUM;
        }
        if(!pageSize){
            pageSize=DEFAULT_PAGESIZE;
        }

        // validate values
        if(isNaN(pageNum)|| isNaN(pageSize) || pageSize>LIMIT_PAGESIZE || pageNum>LIMIT_PAGENUM){
            httpResponse.sendStatus(400);
            httpResponse.send();
            return;
        }



        // check for types
        if((typeof pageSize)==='string')pageSize=parseInt(pageSize);
        if((typeof pageNum)==='string')pageNum=parseInt(pageNum);

        // create stages
        limitStage['$limit'] = pageSize * (pageNum+1);
        skipStage['$skip'] =  pageSize * pageNum;



        // build up togheter
        pipelineArray[pipelineArray.length] = limitStage;
        pipelineArray[pipelineArray.length] = skipStage;

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