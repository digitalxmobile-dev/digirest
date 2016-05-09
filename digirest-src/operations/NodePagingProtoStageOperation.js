/**
 * Created by Aureliano on 23/09/2015.
 * This op add paging to pipelines
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'NodePagingProtoStageOperation';
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
function _sliceData(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** operation configuration */
    var arrayFieldNameFROM = operationObj.conf['params.payload.dataarray'];
    var arrayFieldNameTO = operationObj.conf['params.payload.dataarrayDest']; // null for payload direct placement
    var pageSizeField = operationObj.conf['params.payload.pageSize'];
    var pageNumField = operationObj.conf['params.payload.pageNum'];

    try {

        // data array
        var dataArray = data[arrayFieldNameFROM];
        var pageSize = data[pageSizeField];
        var pageNum =  data[pageNumField];

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

        // create indexes
        var base = pageSize * pageNum;
        var ceiling = pageSize * (pageNum+1);

        // slice to new data
        var arrayOut = [];
        if(dataArray) {
            arrayOut = dataArray.slice(base, ceiling);
        }
        // build up togheter
        if(arrayFieldNameTO){
            data[arrayFieldNameTO] = arrayOut;
        }else{
            data = arrayOut;
        }

        /** callback with funcParamObj updated - maybe */
        funcParamObj.payload = data;
        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports.sliceData=_sliceData;
exports.invoke=_sliceData;