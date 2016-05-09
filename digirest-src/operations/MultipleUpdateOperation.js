/**
 * Created by Aureliano on 19/11/2015.
 * This operation update some object
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'MultipleUpdateOperation';
var RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
var underscore = require('underscore');
var multiOptions = {multi:true};

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
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** pre - operations on data */
    var collection = operationObj.conf['params.collection'];
    var updatefields = operationObj.conf['params.payload.updatefields'] ? operationObj.conf['params.payload.updatefields'].split(',') : null;
    var qualifications = operationObj.conf['params.query.qualification'].split(',');
    var payloadDestination = operationObj.conf['params.payload.destfield'];
    var options = operationObj.conf['params.options'] ? JSON.parse(operationObj.conf['params.options']) : {};
    var objQualification = {};
    var objUpdate = {};

    /** set up the qualification obj */
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

    try {

        /** set the update object */
        var innerUpdateObject = {}
        if(updatefields) {
            for (var i = 0; i < updatefields.length; i++) {
                var fieldName = updatefields[i];
                if (fieldName == '_id') {
                    innerUpdateObject[fieldName] = _getObjectService().getObjectID(data[fieldName]);
                }else if (fieldName.slice(0,1) == '$'){
                    objUpdate[fieldName] = data[fieldName];
                } else {
                    innerUpdateObject[fieldName] = data[fieldName];
                }
            }
        }else{
            // all payload keys
            var keys = Object.keys(data);
            for(var iterator in keys){
                //_getValue(data,keys[iterator],httpRequest.query,httpResponse);
                var fieldName = keys[iterator];
                if (underscore.indexOf(qualifications,fieldName)==-1){
                    if (fieldName == '_id') {
                        innerUpdateObject[fieldName] = _getObjectService().getObjectID(data[fieldName]);
                    }else if (fieldName.slice(0,1) == '$'){
                        objUpdate[fieldName] = data[fieldName];
                    } else {
                        innerUpdateObject[fieldName] = data[fieldName];
                    }
                }
            }
        }


        objUpdate['$set']=innerUpdateObject;
        console.log(MODULE_NAME + ": updateobj [" + JSON.stringify(objUpdate) + ']');

        options = underscore.extend(multiOptions,options);

        _getRunQueryService().runUpdate(
            collection,
            objQualification,
            objUpdate,
            options,
            function onComplete(err,obj) {
                if(obj && obj.ok){
                    if(obj.value){
                        if(!payloadDestination) {
                            funcParamObj.payload = obj.value;
                        }else{
                            funcParamObj.payload[payloadDestination] = obj.value;
                        }
                    }else{
                        if(err){
                            funcParamObj.errorMessage = err.message;
                        }else{
                            funcParamObj.errorMessage = 'Not Found';
                        }
                        httpResponse.status(400);
                        funcParamObj.payload = {'error':'Not Found'};
                    }
                }
                onExecuteComplete(err, funcParamObj)
            }
        )


    }catch(err){
        funcParamObj.errorMessage = err.message;
        onExecuteComplete(err,funcParamObj);
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
exports.update=_update;
exports.invoke=_update;