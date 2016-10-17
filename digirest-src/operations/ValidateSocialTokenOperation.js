/**
 * Created by Aureliano on 26/01/2016.
 * Validate a token from a social (fb,g+)
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ValidateSocialTokenOperation';
var SocialLoginService = require('../objectfactory/ObjectFactory').socialLoginService;


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _validate(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var data = funcParamObj.payload;

    var email = operationObj.conf['params.email'];
    var token = operationObj.conf['params.token'];

    try {

        if(data.is_facebook) {
            _getSocialLoginService().validateFacebookLogin(
                data[email],
                data[token],
                function onValidate(err, val) {
                    if (err || !val.success) {
                        funcParamObj.response.status(401);
                        onExecuteComplete(new Error('401'), funcParamObj);
                    } else {
                        onExecuteComplete(null, funcParamObj);
                    }
                }
            );
        }else if (data.is_google){
            _getSocialLoginService().validateGoogleLogin(
                data[email],
                data[token],
                function onValidate(err, val) {
                    if (err || !val.success) {
                        funcParamObj.response.status(401);
                        onExecuteComplete(new Error('401'), funcParamObj);
                    } else {
                        onExecuteComplete(null, funcParamObj);
                    }
                }
            );
        }

    }catch(error){
        console.error(error);
        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);

    }
}

/**
 * getter for objectservice
 * @returns {*}
 * @private
 */
function _getSocialLoginService(){
    if(!SocialLoginService){
        SocialLoginService = require('../objectfactory/ObjectFactory').socialLoginService;
    }
    return SocialLoginService;
}

/** exports */
exports.invoke=_validate;
