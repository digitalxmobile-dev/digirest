/**
 * Created by Aureliano on 01/07/2015.
 * delete some object from payload
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'HideResultsDataOperation';
var underscore = require('underscore');


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _clear(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    /** operation configuration */
    var fieldsName = operationObj.conf['params.fields'].split(',');

    try {

        // clear
        /*
        for(let row of data){
            for(let field of fieldsName){
                delete row[field]
            }
        }

        funcParamObj.payload = data;
        */

        funcParamObj.payload = underscore.map(
            data,
            function filter(row){
                return underscore.mapObject(
                    row,
                    function(value,field){
                        if(underscore.find(fieldsName,function(f){return f===field})){
                            return null;
                        }else{
                            return value;
                        }
                    });
            }
        );

        onExecuteComplete(null, funcParamObj);

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports._clear=_clear;
exports.invoke=_clear;
