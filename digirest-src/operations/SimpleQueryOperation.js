/**
 * Created by Aureliano on 21/09/2015.
 * Find operation
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'SimpleQueryOperation';
var RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
var underscore = require('underscore');

/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _find(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    var operationObj = funcParamObj.operationRef;
    var httpRequest = funcParamObj.request;
    var httpResponse = funcParamObj.response;
    var data = funcParamObj.payload;

    /** pre - operations on data */
    var collection = operationObj.conf['params.collection'];
    var query = JSON.parse(operationObj.conf['params.query.expression']);
    var qualifications = (operationObj.conf['params.query.qualification'])? operationObj.conf['params.query.qualification'].split(',') : [];
    var cachetime = operationObj.conf['params.cachetime'];
    var payloadFieldTo = operationObj.conf['params.payload.field.to'];
    var optionField = (operationObj.conf['params.query.option'])? JSON.parse(operationObj.conf['params.query.option']):{};

    /** fix the cachetime */
    if (cachetime === 'forever') {
        cachetime = null;
    } else if (!cachetime) {
        cachetime = 0;
    }

    /** set up the query obj */
    /** USE THE QUERY PLACEHOLDER
     *  like "field" : "$$$$X$$$$"
     *  where X is the index of the qualification array
     */
    _replacePlaceholders(query,qualifications,data);
    // filter out undefined values
    query = JSON.parse(JSON.stringify(query));

    try {
        /** run the select */
        _getRunQueryService().runAdvancedCachedSelect(
            collection,
            //JSON.parse(query),
            query,
            optionField,
            cachetime,
            function onComplete(error,values){
                if(!error && values){
                    if(payloadFieldTo){
                        data[payloadFieldTo] = values;
                        funcParamObj.payload = data;
                    }else {
                        funcParamObj.payload = values;
                    }
                }else{
                    funcParamObj.payload = JSON.stringify(error);
                }
                onExecuteComplete(error,funcParamObj);
            }
        );
    }catch(error){

        /** dispatch the error to the next op in chain */
        onExecuteComplete(error,funcParamObj);
    }
}

/**
 * private gettter for run query service
 * @returns {*}
 * @private
 */
function _getRunQueryService(){
    if(!RunQueryService){
        RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
    }
    return RunQueryService;
}

/**
 * REPLACE THE QUERY PLACEHOLDER (recursive)
 * @param root
 * @param qualification
 * @param data
 * @private
 */
function _replacePlaceholders(root,qualification,data){
    if(root && root instanceof Object){
        var keys = Object.keys(root);
        for(var index in keys){
            var key = keys[index];
            if(root[key] instanceof Object){
                _replacePlaceholders(root[key],qualification,data);
            }else{
                if(root[key] && root[key].indexOf && root[key].indexOf('$$$$')!=-1){
                    var qualificationPosition = root[key].split('$$$$')[1];
                    root[key] = data[qualification[qualificationPosition]];
                }
            }
        }
    }
}

/****** E.G. *********************************
 * name the placeholder with the qualifications array position
 operation.blacklist.getall.params.query.qualification=id_business,id_something
 operation.blacklist.getall.params.query.expression={"id_business":"$$$$0","is_enabled":true,"id_something":"$$$$1"}
 */

/** exports */
exports.find=_find;
exports.invoke=_find;