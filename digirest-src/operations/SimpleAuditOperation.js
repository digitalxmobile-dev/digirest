/**
 * Created by mox on 04/02/16.
 * This operations set the audit to payload
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SimpleAuditOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _audit(funcParamObj,onExecuteComplete){

    /** default object content of an operation DO NOT REMOVE USED IN EVAL*/
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    try {

        /** get parameters */
        var auditDest = operationObj.conf['params.audit.expression'];
        if(!auditDest){
            auditDest = 'cd_lastupdate';
        }
        var auditExpressions = operationObj.conf['params.expressions'].split(',');
        for (var iterator in auditExpressions){
            var auditName = eval(auditExpressions[iterator]);
            if(auditName){
                funcParamObj.payload[auditDest] = auditName;
                onExecuteComplete(null, funcParamObj);
                return;
            }
        }


        /** callback with funcParamObj updated - maybe */

    }catch(error){


        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/** exports */
exports.invoke=_audit;