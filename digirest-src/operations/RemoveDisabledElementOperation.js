/**
 * Created by Aureliano on 29/01/2016.
 *
 * This file remove all elements that have a "is_enabled" = false in it;
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'RemoveDisabledElementOperation';
var REJECTED_OBJ = '§§§REJECTED§§§';
var underscore = require('underscore');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _addStage(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var data = funcParamObj.payload;

    /** remove disabled items */
    var newData = _rejectDisabled(data);

    /** callback with funcParamObj updated - maybe */
    funcParamObj.payload = newData;
    onExecuteComplete(null, funcParamObj);


}
/**
 * entry point for recursive function
 * @param obj
 * @returns {*}
 * @private
 */
function _rejectDisabled(obj){
    obj = _rejectDisabledRecursive(obj);
    return _cleanRejectedItem(obj);
}
/**
 * remove disabled element recursively
 * @param obj
 * @returns {*}
 * @private
 */
function _rejectDisabledRecursive(obj){
    // if the object is disabled, reject
    if (underscore.isObject(obj)&& _isDisabled(obj)){
        return REJECTED_OBJ;
    }else{
        // iterate over obj's keys and recursively remove
        var keys = underscore.allKeys(obj);
        for(var i in keys){
            if(underscore.isObject(obj[keys[i]]) && !underscore.isFunction(obj[keys[i]])) {
                obj[keys[i]] = _rejectDisabledRecursive(obj[keys[i]]);
            }
        }

        // return object cleaned up
        return _cleanRejectedItem(obj);
    }
}

/**
 * true if element is disabled
 * @param element
 * @returns {boolean}
 * @private
 */
function _isDisabled(element){
    if(element.is_enabled===null) return false;
    if(element.is_enabled===undefined) return false;
    if(element.is_enabled===true) return false;
    if(element.is_enabled===false) return true;
}

/**
 * return true if value is rejected
 * @param value
 * @param key
 * @param object
 * @returns {boolean}
 * @private
 */
function _rejectedObj(value,key,object){
    return (value===REJECTED_OBJ);
}

/**
 * clean up arrays and object from rejecte items
 * @param obj
 * @returns {*}
 * @private
 */
function _cleanRejectedItem(obj){
    // clean up reject items
    if(underscore.isArray(obj)) {
        obj = underscore.reject(obj,_rejectedObj);
    }else if(underscore.isObject(obj)){
        obj = underscore.omit(obj,_rejectedObj);
    }
    return obj;
}


/** exports */
exports.addStage=_addStage;
exports.invoke=_addStage;
