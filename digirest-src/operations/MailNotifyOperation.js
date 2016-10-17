/**
 * Created by Aureliano on 26/07/2016.
 */

/**
 * Created by Aureliano on 10/02/2016.
 * This file is a simple change payload operation
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'MailNotifyOperation';
const ASQ = require('asynquence-contrib');


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _operationfunctionname (funcParamObj,onExecuteComplete){
    
    /** default object content of an operation */
    let operationObj = funcParamObj.operationRef; // = this operation
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    let data = funcParamObj.payload;

    /** operation configuration */
    let configuration1 = operationObj.conf['params.xx.yyy'];
    let configuration2 = operationObj.conf['params.xx.zzz'];

    doThings(
        data,
        configuration1,
        configuration2,
        function onDone(err,val){
            funcParamObj.payload = val;
            onExecuteComplete(err,funcParamObj); // pass to the next operation, if any
        }
    );

}

/**
 * private method, get the run query service
 * @returns {*}
 * @private
 */
function _getObjectService(){
    return require('../../digirest-src/objectfactory/ObjectFactory').objectService;
}
/**
 * private method, get the run query service
 * @returns {*}
 * @private
 */
function _getRunQueryService(){
    return require('../../digirest-src/objectfactory/ObjectFactory').runQueryService;
}
/**
 * private method, get the run query service
 * @returns {*}
 * @private
 */
function _getMailService(){
    return require('../../digirest-src/objectfactory/ObjectFactory').mailService;
}