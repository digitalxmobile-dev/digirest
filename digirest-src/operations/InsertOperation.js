/**
 * Created by Aureliano on 19/11/2015.
 * This operation insert a new object
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'InsertOperation';
var ObjectService = require('../objectfactory/ObjectFactory').objectService;
var async = require('async');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _insert(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** pre - operations on data */
    var collection = operationObj.conf['params.collection'];
    var newObjectField = operationObj.conf['params.payload.newobject'];
    var qualifications = (operationObj.conf['params.query.qualification'])?(operationObj.conf['params.query.qualification']).split(','):null;
    var lockPayload = operationObj.conf['params.payload.lock'];
	var fieldDest = operationObj.conf['params.dest.field'];
    var objQualification = {};
    var objInsert = {};

    /** set up the qualification obj, if required, else skip the verification step */
    if(qualifications) {
        for (var i = 0; i < qualifications.length; i++) {
            var fieldName = qualifications[i];
            objQualification[fieldName] = data[fieldName];
            if (!objQualification[fieldName]) {
                httpResponse.sendStatus(400);
                httpResponse.send();
                return;
            }
        }
        console.log(MODULE_NAME + ": qualification [" + JSON.stringify(objQualification) + ']');
    }

    /** get the new object, if defined a field */
    if(newObjectField){
        objInsert = data[newObjectField];
    }else{
        objInsert = data;
    }

    try {

        /** verify and insert */
        async.waterfall([
                // if present a qualification, verify the new object
                function verifyInsert(callback) {
                    if (qualifications && objQualification) {
                        _getObjectService().getObjectByQualification(objQualification, collection, callback);
                    } else {
                        callback(null,null);
                    }
                },
                // if return is empty, insert
                function insert(previousObject, callback) {
                    // if already exists, raise an error
                    if (previousObject) {
                        httpResponse.status(409);
                        callback(new Error('409'),null);
                    } else {
                        _getObjectService().insertObject(objInsert, collection, callback);
                    }
                },
                // finalize
                function onOK(response, callback) {
                    if(!lockPayload) {                   
						if(fieldDest){
                        	funcParamObj.payload[fieldDest] = response;
                    	}else {
                        	funcParamObj.payload = response;
                    	}
                    }
                    onExecuteComplete(null, funcParamObj);
                }
            ],
            function onFinish(error, value) {
                if(error){
                    console.error((error));
                }
                onExecuteComplete(error, value);
            });

    }catch(err){
        onExecuteComplete(err, funcParamObj);
    }
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
exports.insert=_insert;
exports.invoke=_insert;