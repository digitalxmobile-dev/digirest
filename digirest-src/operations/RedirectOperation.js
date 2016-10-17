/**
 * Created by Aureliano on 02/05/2016.
 * res redirect operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'RedirectOperation';

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _redir(funcParamObj,onExecuteComplete){

    var operationObj = funcParamObj.operationRef;
    var httpResponse = funcParamObj.response;
    var envName = operationObj.conf['params.redirect.env.name'];

    try {

        httpResponse.redirect(envName);
        onExecuteComplete(null,funcParamObj);

    }catch(err){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}


/** exports */
exports.redir=_redir;
exports.invoke=_redir;