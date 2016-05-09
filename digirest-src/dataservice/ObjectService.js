/**
 * Created by Aureliano on 14/09/2015.
 */
/**
 * This file manage the mongo objects at medium level
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ObjectService';
var ObjectID = require('mongodb').ObjectID;
var RunQueryService = require('../objectfactory/ObjectFactory').runQueryService;
var ConnectionService = require('../objectFactory/ObjectFactory').connectionService;


/**
 * return a objectid object
 * @param strId
 * @returns {*}
 * @private
 */
function _getObjectID(strId){
    return new ObjectID(strId);
}

/**
 * Return an object by qualification
 * @param qualification
 * @param collection
 * @param onGet
 * @private
 */
function _getObjectByQualification(qualification,collection,onGet){
    //_getRunQueryService().runOne(collection,qualification,onGet);
    _getRunQueryService().runSelect(
        collection,
        qualification,
        function onSelect(err,list){
            if(list){
                onGet(err,list[0]);
            }else{
                onGet(err,list);
            }
        }
    );
}

/**
 * Return an array of object by qualification
 * @param qualification
 * @param collection
 * @param onGet
 * @private
 */
function _getObjectsByQualification(qualification,collection,onGet){
    //_getRunQueryService().runOne(collection,qualification,onGet);
    _getRunQueryService().runSelect(
        collection,
        qualification,
        onGet
    );
}
/**
 * Return an object by ID
 * @param strId
 * @param collection
 * @param onGet
 * @private
 */
function _getObjectById(strId,collection,onGet){
    var queryObj =  {_id : _getObjectID(strId)};
    _getRunQueryService().runOne(collection,queryObj,onGet);
}

/**
 * insert a new object in database
 * @param newObject
 * @param collection
 * @param onInsert
 * @private
 */
function _insertObject(newObject, collection, onInsert){
    _getRunQueryService().runInsert(
        collection,
        newObject,
        onInsert);
}

/**
 * update an object by qualification
 * @param qualification
 * @param updateobj
 * @param options
 * @param onComplete
 * @private
 */
function _updateObject(qualification,collection,updateobj,options,onComplete){
    _getConnectionService().getConnection(
        function onConnected(error,dbConnection){
            if(error){
                onComplete(error,null);
            }else {
                if(!options){
                    options={};
                }
                var _collection = dbConnection.collection(collection);
                _collection.findOneAndUpdate(qualification,
                    updateobj,
                    options,
                    function onUpdate(error,result){
                        dbConnection.close();
                        // FIXME result.value contiene l'oggetto prima dell'update
                        onComplete(error,result);
                    });
            }
        }
    );
}

/**
 * update some objects by qualification
 * @param qualification
 * @param updateobj
 * @param options
 * @param onComplete
 * @private
 */
function _updateObjects(qualification,collection,updateobj,options,onComplete){
    _getConnectionService().getConnection(
        function onConnected(error,dbConnection){
            if(error){
                onComplete(error,null);
            }else {
                if(!options){
                    options={};
                }
                var _collection = dbConnection.collection(collection);
                _collection.update(qualification,
                    updateobj,
                    options,
                    function onUpdate(error,result){
                        dbConnection.close();
                        // FIXME result.value contiene l'oggetto prima dell'update
                        onComplete(error,result);
                    });
            }
        }
    );
}
/**
 * delete a single object
 * @param qualification for select theobject
 * @param collection
 * @param options
 * @param onComplete
 * @private
 */
function _removeObject(qualification,collection,options,onComplete){
    _getConnectionService().getConnection(
        function onConnected(error,dbConnection){
            if(error) {
                onComplete(error,null);
            }else {
                if(!options){
                    options={};
                }
                var _collection = dbConnection.collection(collection);
                _collection.deleteOne(qualification,
                    options,
                    function onDelete(error,result){
                        dbConnection.close();
                        onComplete(error,result);
                    });
            }
        }
    );
}
/**
 * private method, get the run query service
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
 * private method, get the connection service
 * @returns {*}
 * @private
 */
function _getConnectionService(){
    if(!ConnectionService){
        ConnectionService = require('../objectfactory/ObjectFactory').connectionService;
    }
    return ConnectionService;
}

/** exports */
exports.getObjectID=_getObjectID;
exports.getObjectById=_getObjectById;
exports.updateObject=_updateObject;
exports.updateObjects=_updateObjects;
exports.getObjectByQualification=_getObjectByQualification;
exports.getObjectsByQualification=_getObjectsByQualification;
exports.removeObject=_removeObject;
exports.insertObject=_insertObject;
