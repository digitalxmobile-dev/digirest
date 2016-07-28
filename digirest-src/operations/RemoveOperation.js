/**
 * Created by Aureliano on 17809/2015.
 * This operation remove an object
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'RemoveOperation';
var RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _remove(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;

    /** pre - operations on data */
    var collection = operationObj.conf['params.collection'];
    var condition = operationObj.conf['params.condition'];
    var options = operationObj.conf['params.options'];

    try {

        condition = eval(condition);

        _getRunQueryService().doRemove(
            collection,
            condition,
            function onOk(err,obj){
                if(!err){
                    funcParamObj.payload = {success:true};
                }else{
                    funcParamObj.payload = {success:false};
                    funcParamObj.errorMessage = err.message;
                }
                onExecuteComplete(err,funcParamObj);
            }
        );

    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/**
 * return the run queryservice
 * @returns {*}
 * @private
 */
function _getRunQueryService(){
    if(!RunQueryService){
        RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
    }else{
        return RunQueryService;
    }
}

/** exports */
exports.invoke=_remove;