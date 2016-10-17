/**
 * Created by Aureliano on 04/12/2015.
 * Operation that performs payload purge
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'PurgePayloadOperation';
const underscore = require('underscore');


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _purge(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var data = funcParamObj.payload;

    /** get expire difference */
    var remove = funcParamObj.operationRef.conf['params.payload.remove'];
    var leave = funcParamObj.operationRef.conf['params.payload.leave'];

    // get array of fields
    var fields = [];
    if(remove) fields = remove.split(',');
    else if (leave) fields = leave.split(',');


    var newdata;
    if(underscore.isArray(data)){
        newdata = underscore.map(data,(itm)=>{
            return purgeObject(remove,itm,fields);
        })
    }else{
        newdata = purgeObject(remove, data, fields);
    }

    // packit
    funcParamObj.payload = newdata;

    // send
    onExecuteComplete(null,funcParamObj);

}

/**
 * purge the objects
 * @param remove
 * @param data
 * @param fields
 * @returns {{}}
 */
function purgeObject(remove, data, fields) {
// manage remove / leave
    var newdata = remove ? data : {};
    for (var iterator in fields) {
        var current = fields[iterator];
        if (remove) {
            if (current.split('.').length > 1) {
                var keyArray = current.split('.');
                var obj = newdata;
                for (var it in keyArray) {
                    if (it == keyArray.length - 1) {
                        delete obj[keyArray[it]];
                    } else {
                        obj = obj[keyArray[it]];
                    }
                }
            } else {
                delete newdata[current];
            }
        } else {
            newdata[current] = data[current];
        }
    }
    return newdata;
}


/** exports */
exports.purge=_purge;
exports.invoke=_purge;