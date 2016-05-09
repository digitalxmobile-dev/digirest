/**
 * Created by Aureliano on 19/11/2015.
 * This operation update an object (with $set)
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'UpdateOperation';
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var underscore = require('underscore');



/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _update(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** pre - operations on data */
    var collection = operationObj.conf['params.collection'];
    var updatefields = operationObj.conf['params.payload.updatefields'] ? operationObj.conf['params.payload.updatefields'].split(',') : null;
    var qualifications = operationObj.conf['params.query.qualification'].split(',');
    var payloadDestination = operationObj.conf['params.payload.destfield'];
    var options = operationObj.conf['params.query.options'];
    var objQualification = {};
    var objUpdate = {};

    /** manage options */
    options = _initOptions(options);

    /** set up the qualification obj */
    for (var i = 0; i < qualifications.length; i++) {
        var fieldName = qualifications[i];
        if(fieldName === '_id' && typeof data[fieldName] == 'string'){
            try {
                objQualification['_id'] = _getObjectService().getObjectID(data[fieldName]);
            }catch(ex){
                objQualification[fieldName] = data[fieldName];
            }
        }else {
            objQualification[fieldName] = data[fieldName];
        }
        if (!objQualification[fieldName]) {
            httpResponse.sendStatus(400);
            httpResponse.send();
            return;
        }
    }
    console.log(MODULE_NAME + ": qualification [" + JSON.stringify(objQualification) + ']');

    try {

        _generateUpdateObj(updatefields, data, objUpdate, qualifications);
        console.log(MODULE_NAME + ": updateobj [" + JSON.stringify(objUpdate) + '] options [' + options + ']');

        _getObjectService().updateObject(
            objQualification,
            collection,
            objUpdate,
            options,
            function onComplete(err,obj) {
                _manageReturn(obj, payloadDestination, funcParamObj, err, httpResponse, onExecuteComplete);
            }
        );

    }catch(err){
        funcParamObj.errorMessage = err.message;
        onExecuteComplete(err,funcParamObj);
    }

}

/** set up update object */
function _generateUpdateObj(updatefields, data, objUpdate, qualifications) {
    /** set the update object */
    var innerUpdateObject = {}
    if (updatefields) {
        for (var i = 0; i < updatefields.length; i++) {
            var fieldName = updatefields[i];
            if (fieldName == '_id') {
                innerUpdateObject[fieldName] = _getObjectService().getObjectID(data[fieldName]);
            } else if (fieldName.slice(0, 1) == '$' && data[fieldName] ) {
                objUpdate[fieldName] = data[fieldName];
            } else if (typeof data[fieldName] != 'undefined'){
                innerUpdateObject[fieldName] = data[fieldName];
            }
        }
    } else {
        // all payload keys
        var keys = Object.keys(data);
        for (var iterator in keys) {
            //_getValue(data,keys[iterator],httpRequest.query,httpResponse);
            var fieldName = keys[iterator];
            if (underscore.indexOf(qualifications, fieldName) == -1) {
                if (fieldName == '_id') {
                    innerUpdateObject[fieldName] = _getObjectService().getObjectID(data[fieldName]);
                } else if (fieldName.slice(0, 1) == '$') {
                    objUpdate[fieldName] = data[fieldName];
                } else {
                    innerUpdateObject[fieldName] = data[fieldName];
                }
            }
        }
    }


    objUpdate['$set'] = innerUpdateObject;
}

/**
 * init options
 * @param options
 * @returns {*}
 * @private
 */
function _initOptions(options) {
    if (options) {
        options = JSON.parse(options);
    } else {
        options = {};
    }
    return options;
}

/**
 * manage return objects
 * @param obj
 * @param payloadDestination
 * @param funcParamObj
 * @param err
 * @param httpResponse
 * @param onExecuteComplete
 * @private
 */
function _manageReturn(obj, payloadDestination, funcParamObj, err, httpResponse, onExecuteComplete) {
    if (obj && obj.ok) {
        if (obj.value) {
            if (!payloadDestination) {
                funcParamObj.payload = obj.value;
            } else {
                funcParamObj.payload[payloadDestination] = obj.value;
            }
        } else {
            if (err) {
                funcParamObj.errorMessage = err.message;
            } else {
                funcParamObj.errorMessage = 'Not Found';
            }
            httpResponse.statusCode = 400;
            funcParamObj.payload = {'error': 'Not Found'};
            funcParamObj.operationRef.next = null;
        }
    }
    onExecuteComplete(err, funcParamObj)
}

/**
 * return the run queryservice
 * @returns {*}
 * @private
 */
function _getObjectService(){
    if(!ObjectService){
        ObjectService = require('../objectfactory/ObjectFactory').objectService;
    }else{
        return ObjectService;
    }
}

/** exports */
exports.update=_update;
exports.invoke=_update;