/**
 * Created by Aureliano on 14/09/2015.
 */
/**
 * This file manage the mongo objects at medium level
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'ObjectService';
const ObjectID = require('mongodb').ObjectID;
const ASQ = require('asynquence-contrib');
const underscore = require('underscore');

/**
 * return a objectid object
 * @param strId
 * @returns {*}
 * @private
 */
function _getObjectID(strId) {
  return new ObjectID(strId);
}

/**
 * Return an object by qualification
 * @param qualification
 * @param collection
 * @param onGet
 * @private
 */
function _getObjectByQualification(qualification, collection, onGet) {
  //_getRunQueryService().runOne(collection,qualification,onGet);
  ASQ((done)=> {
    _getRunQueryService().runSelect(
      collection,
      qualification,
      done.errfcb);
  }).then((done, o)=> {
    if (o && underscore.isArray(o)) {
      onGet(null, o[0])
    } else {
      onGet(null, o);
    }
    done();
  }).or((err)=> {
    onGet(err, null);
  });
}

/**
 * Return an array of object by qualification
 * @param qualification
 * @param collection
 * @param onGet
 * @private
 */
function _getObjectsByQualification(qualification, collection, onGet) {
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
function _getObjectById(strId, collection, onGet) {
  _getRunQueryService().runOne(
    collection,
    {_id: _getObjectID(strId)},
    onGet
  );
}

/**
 * insert a new object in database
 * @param newObject
 * @param collection
 * @param onInsert
 * @private
 */
function _insertObject(newObject, collection, onInsert) {
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
 * @depreacted
 */
function _updateObject(qualification, collection, updateobj, options, onComplete) {
  return _updateObjects(qualification, collection, updateobj, options, onComplete);
}

/**
 * update some objects by qualification
 * @param qualification
 * @param updateobj
 * @param options
 * @param onComplete
 * @private
 */
function _updateObjects(qualification, collection, updateobj, options, onComplete) {

  var dbpointer;
  ASQ((done)=> {  // get connection
    _getConnectionService().getConnection(done.errfcb);
  }).then((done, db)=> { // run query
    dbpointer = db;
    db.collection(collection)
      .update(
        qualification,
        updateobj,
        options || {},
        done.errfcb
      );
  }).then((done, o)=> { // close and return
    if (dbpointer)dbpointer.close();
    onComplete(null, o);
    done();
  }).or((error)=> {
    onComplete(error, null);
  });

}
/**
 * delete a single object
 * @param qualification for select theobject
 * @param collection
 * @param options
 * @param onComplete
 * @private
 */
function _removeObject(qualification, collection, options, onComplete) {
  var dbpointer;
  ASQ((done)=> {  // get connection
    _getConnectionService().getConnection(done.errfcb);
  }).then((done, db)=> { // run query
    dbpointer = db;
    db.collection(collection)
      .deleteOne(
        qualification,
        options || {},
        done.errfcb
      );
  }).then((done, o)=> { // close and return
    if (dbpointer)dbpointer.close();
    onComplete(null, o);
    done();
  }).or((error)=> {
    onComplete(error, null);
  });
}
/**
 * private method, get the run query service
 * @returns {*}
 * @private
 */
function _getRunQueryService() {
  return require('../objectfactory/ObjectFactory').runQueryService;
}

/**
 * private method, get the connection service
 * @returns {*}
 * @private
 */
function _getConnectionService() {
  return require('../objectfactory/ObjectFactory').connectionService;
}

/** exports */
exports.getObjectID = _getObjectID;
exports.getObjectById = _getObjectById;
exports.updateObject = _updateObject;
exports.updateObjects = _updateObjects;
exports.getObjectByQualification = _getObjectByQualification;
exports.getObjectsByQualification = _getObjectsByQualification;
exports.removeObject = _removeObject;
exports.insertObject = _insertObject;
