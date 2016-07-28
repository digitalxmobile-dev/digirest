/**
 * Created by Aureliano on 28/10/2015.
 */
/**
 * This is a local db service, based on loki
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'LocalDbService';
var DB_NAME = '..\loki.json';
var Loki = require('lokijs');
var async = require('async');
var CloneFactory = require('cloneextend');


var db = new Loki(DB_NAME,
    {
        //autoload: true,
        autosave: true,
        autosaveInterval: 10000
    });


/**
 * async write on db
 * @param collectionName
 * @param object
 * @private
 */
function _atomicWrite(collectionName,object,retry){
    if(!retry){
        retry=0;
    }else if (retry>1){
        // fail silently
        return;
    }
    process.nextTick(function asyncAtomicWrite(){
        try {
            db.loadDatabase(
                {},
                function onLoad() {
                    var collection = db.getCollection(collectionName);
                    if (!collection) {
                        collection = db.addCollection(collectionName);
                    }
                    collection.insert(object);
                }
            );
        }catch(error){
            db.addCollection(collectionName);
            db.save();
            _atomicWrite(collectionName,object,retry++);
        }
    });
}

/**
 * get data from a collection
 * @param collectionName
 * @param query
 * @param onGet
 * @private
 */
function _getData(collectionName,query,onGet){
    db.loadDatabase(
        {},
        function onLoad(){
            var collection = db.getCollection(collectionName);
            if(!collection){
                onGet(null,{});
            }else{
                var data = collection.find(query);
                onGet(null,data);
            }

        }
    );
}

/**
 * exports all the data and clean the collection
 * @param collectionName
 * @param onFinish
 * @private
 */
function _exportData(collectionName,onFinish){
    var query = {};
    _getData(
        collectionName,
        query,
        function onGet(error,data){
            var dataOut  = CloneFactory.clone(data);
            if(dataOut && dataOut.length>0) {
                db.getCollection(collectionName).removeDataOnly();
            }
            onFinish(error,dataOut);
        }
    )
}

/** exports */
exports.atomicWrite=_atomicWrite;
exports.getData=_getData;
exports.exportData=_exportData;