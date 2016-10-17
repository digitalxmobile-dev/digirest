/**
 * Created by Aureliano on 11/07/2016.
 * this resolve a query against a lookup to an ID or an array of ID
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'SearchLookupOperation';
const underscore = require('underscore');


/**
 * the function to be invoked by the operation service
 * WARNING PARAMETER IS FIXED
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _resolve(funcParamObj,onExecuteComplete){

    /** default object content of an operation */
    let operationObj = funcParamObj.operationRef;
    let data = funcParamObj.payload;

    /** operation configuration */
    let payloadField = operationObj.conf['params.payload.field'];
    if(!data[payloadField]){
        onExecuteComplete(null,funcParamObj);
    }else {
        let collection = operationObj.conf['params.collection.name'];
        let collectionField = operationObj.conf['params.collection.field'];
        let query = JSON.parse(operationObj.conf['params.collection.query'] || '{}');

        var reg = new RegExp(data[payloadField], 'i');
        query[collectionField] = {'$regex': reg};

        _getObjectService().getObjectsByQualification(
            query,
            collection,
            function (err, results){
                if(results && results.length==1){
                    data[payloadField] = results[0]._id.toString();
                }else{
                    var arrayIn = [];
                    for(var i=0; i<results.length; i++){
                        arrayIn.push(results[i]._id.toString());
                    }
                    data[payloadField] = {'$in':arrayIn};
                }
                /** callback with funcParamObj updated - maybe */
                funcParamObj.payload = data;
                onExecuteComplete(null, funcParamObj);
            }
        );
    }
}

/**
 * private gettter for objectservice
 * @returns {*}
 * @private
 */
function _getObjectService(){
    return require('../objectfactory/ObjectFactory').objectService;
}

/** exports */
exports.resolve=_resolve;
exports.invoke=_resolve;
