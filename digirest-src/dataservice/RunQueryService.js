/**
 * Created by Aureliano on 14/09/2015.
 */
/**
 * This file manage the mongo queries
 * Author: Aureliano
 */
'use strict';

/** global requires and vars */
var MODULE_NAME = 'RunQueryService';
var RETURN_ONE_OK = {w: 1};
var UPDATE_OPTION = {w: 1, multi: true};
var ERROR_COLLECTION = '_Errors';
var PRINT_QUERY = process.env.PRINT_QUERY;
var underscore = require('underscore');
var async = require('async');
var ASQ = require('asynquence-contrib');
const util = require('util');

/**
 * run a select query on a collection
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _runAggregate(collectionName, pipeline, options, onComplete) {
  let db, collection, key;
  ASQ(function getConnection(done) {
    _getConnectionService().getConnection(done.errfcb);
  }).then(function query(done, dbConnection) {
    db = dbConnection;
    if (!options) {
      options = {};
    }
    collection = dbConnection.collection(collectionName);
    key = _logQueryStart(collection, pipeline);
    collection.aggregate(pipeline, options, done.errfcb);
  }).then(function complete(done, array) {
    _logQueryStop(collection, pipeline, array ? array.length : null, key);
    onComplete(null, array || []);
    db.close();
    done();
  }).or(function manage(error) {
    console.error(error);
    onComplete(error, null);
  });
}

/**
 * run a select query on a collection
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _runSelect(collection, query, onComplete) {
  _getConnectionService().getConnection(
    function onConnected(error, dbConnection) {
      if (error) {
        onComplete(error, null);
      } else {
        var listOut = [];
        var _collection = dbConnection.collection(collection);
        var key = _logQueryStart(collection, query);
        _collection.find(query).toArray(function onGet(err, list) {
          //console.log(list);
          if (list) {
            try {
              // list.length may be dangerous
              _logQueryStop(collection, query, list.length, key);
            } catch (err) {
              // do nothing
            }
            dbConnection.close();
            onComplete(null, list);
          } else {
            _logQueryStop(collection, query, null, key);
            dbConnection.close();
            onComplete(err, list);
          }
        });
      }
    }
  );
}

/**
 * run a select query on a collection
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _runAdvancedSelect(collection, query, option, onComplete) {
  _getConnectionService().getConnection(
    function onConnected(error, dbConnection) {
      if (error) {
        onComplete(error, null);
      } else {
        var listOut = [];
        var _collection = dbConnection.collection(collection);
        var key = _logQueryStart(collection, query);
        _collection.find(query, option).toArray(function onGet(err, list) {
          //console.log(list);/
          if (list) {
            try {
              // list.length may be dangerous
              _logQueryStop(collection, query, list.length, key);
            } catch (err) {
              // do nothing
            }
            dbConnection.close();
            onComplete(null, list);
          } else {
            _logQueryStop(collection, query, null, key);
            dbConnection.close();
            onComplete(err, list);
          }
        });
      }
    }
  );
}

/**
 * run a single line result select query
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _runOne(collection, query, onComplete) {
  _getConnectionService().getConnection(
    function onConnected(error, dbConnection) {
      if (error) {
        onComplete(error, null);
      } else {
        var _collection = dbConnection.collection(collection);
        var key = _logQueryStart(collection, query);
        _collection.findOne(query,
          function onGet(err, obj) {
            _logQueryStop(collection, query, 0, key);
            dbConnection.close();
            onComplete(err, obj);
          }
        );
      }
    }
  );
}

/**
 * Execute the distinct with cache
 * @param collection
 * @param distinct
 * @param query
 * @param options
 * @param cachelife lifetime in MS of the cache entry
 * @param onComplete
 * @private
 */
function _runCachedDistinct(collection, distinct, query, options, cachelife, onComplete) {
  var foundInCache = false;
  var cachekey = collection + JSON.stringify(distinct) + JSON.stringify(query);

  if (_getCacheService()) {
    var value = _getCacheService().get(cachekey);
    if (value) {
      foundInCache = true;
      console.log('CACHE HIT! : ' + cachekey);
      onComplete(null, value);
    } else {
      console.log('CACHE MISS! : ' + cachekey);
    }
  } else {
    console.log('CACHE MISS! No cacheservice: ' + cachekey);

  }

  // human readable if only
  if (!foundInCache) {
    _runDistinct(
      collection,
      distinct,
      query,
      options,
      function onSelectReturn(error, listOut) {
        if (listOut) {
          if (_getCacheService() && cachekey) {
            if (cachelife) {
              _getCacheService().put(cachekey, listOut, cachelife);
            } else {
              _getCacheService().put(cachekey, listOut);
            }
            console.log('CACHE PUT! : ' + cachekey);
          }
          onComplete(null, listOut);
        } else {
          onComplete(error, null);
        }
      });
  }
}

/**
 * execute the select with cache
 * @param collection the collection to query
 * @param query the query to be executed
 * @param cachelife lifetime in MS of the cache entry
 * @param onComplete callback action
 * @private
 */
function _runCachedSelect(collection, query, cachelife, onComplete) {
  var foundInCache = false;
  var cachekey = collection + JSON.stringify(query);

  if (_getCacheService()) {
    var value = _getCacheService().get(cachekey);
    if (value) {
      foundInCache = true;
      console.log('CACHE HIT! : ' + cachekey);
      onComplete(null, value);
    } else {
      console.log('CACHE MISS! : ' + cachekey);
    }
  } else {
    console.log('CACHE MISS! No cacheservice: ' + cachekey);

  }

  // human readable if only
  if (!foundInCache) {
    _runSelect(
      collection,
      query,
      function onSelectReturn(error, listOut) {
        if (listOut) {
          if (_getCacheService() && cachekey) {
            if (cachelife) {
              _getCacheService().put(cachekey, listOut, cachelife);
            } else {
              _getCacheService().put(cachekey, listOut);
            }
            console.log('CACHE PUT! : ' + cachekey);
          }
          onComplete(null, listOut);
        } else {
          onComplete(error, null);
        }
      });
  }
}

/**
 * execute the select with cache
 * @param collection the collection to query
 * @param query the query to be executed
 * @param cachelife lifetime in MS of the cache entry
 * @param onComplete callback action
 * @private
 */
function _runAdvancedCachedSelect(collection, query, options, cachelife, onComplete) {
  var foundInCache = false;
  var cachekey = collection + JSON.stringify(query);

  if (_getCacheService()) {
    var value = _getCacheService().get(cachekey);
    if (value) {
      foundInCache = true;
      console.log('CACHE HIT! : ' + cachekey);
      onComplete(null, value);
    } else {
      console.log('CACHE MISS! : ' + cachekey);
    }
  } else {
    console.log('CACHE MISS! No cacheservice: ' + cachekey);

  }

  // human readable if only
  if (!foundInCache) {
    _runAdvancedSelect(
      collection,
      query,
      options,
      function onSelectReturn(error, listOut) {
        if (listOut) {
          if (_getCacheService() && cachekey) {
            if (cachelife) {
              _getCacheService().put(cachekey, listOut, cachelife);
            } else {
              _getCacheService().put(cachekey, listOut);
            }
            console.log('CACHE PUT! : ' + cachekey);
          }
          onComplete(null, listOut);
        } else {
          onComplete(error, null);
        }
      });
  }
}

/**
 * Run a distinct query
 * @param collection
 * @param distinct parameter
 * @param query to filter data (e.g. field='mikeymouse')
 * @param options
 * @param onComplete
 * @private
 */
function _runDistinct(collection, distinct, query, options, onComplete) {
  _getConnectionService().getConnection(
    function onConnected(error, dbConnection) {
      if (error) {
        onComplete(error, null);
      } else {
        var listOut = [];
        if (!options) {
          options = {};
        }
        var _collection = dbConnection.collection(collection);
        var key = _logQueryStart(collection, distinct + JSON.stringify(query));
        _collection.distinct(
          distinct,
          query,
          options,
          function onGet(err, list) {
            //console.log(list);
            if (list && !err) {
              _logQueryStop(collection, distinct + JSON.stringify(query), list.length, key);
              dbConnection.close();
              onComplete(null, list);
            } else {
              _logQueryStop(collection, distinct + query, null, key);
              dbConnection.close();
              onComplete(err, list);
            }
          });
      }
    }
  );
}

/**
 * run a insert
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _runInsert(collection, query, onComplete) {
  _getConnectionService().getConnection(
    function onConnected(error, dbConnection) {
      if (error) {
        onComplete(error, null);
      } else {
        var listOut = [];
        var _collection = dbConnection.collection(collection);
        var key = _logQueryStart(collection, query);
        _collection.insert(query,
          RETURN_ONE_OK,
          function onGet(err, obj) {
            _logQueryStop(collection, query, 0, key);
            dbConnection.close();
            try {
              if (collection != ERROR_COLLECTION) {
                console.log(MODULE_NAME + ': Insert Operation %s', tostring(obj));
              }
            } catch (err) {
              // ignore
            }
            onComplete(err, obj);
          }
        );
      }
    }
  );
}

/**
 * run a update
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _runUpdate(collection, query, updateobj, options, onComplete) {
  _getConnectionService().getConnection(
    function onConnected(error, dbConnection) {
      if (error) {
        onComplete(error, null);
      } else {
        var listOut = [];
        var _collection = dbConnection.collection(collection);
        var key = _logQueryStart(collection, query);
        _collection.update(
          query,
          updateobj,
          underscore.extend(UPDATE_OPTION, options),
          function onGet(err, obj) {
            _logQueryStop(collection, query, 0, key);
            dbConnection.close();
            onComplete(err, obj);
          }
        );
      }
    }
  );
}

/**
 * update or insert the object
 * @param qualification
 * @param sort
 * @param update
 * @param options
 * @param collection
 * @param onGetComplete
 * @private
 */
function _runFindModifiy(qualification, sort, update, options, collection, onGetComplete) {
  var dbpointer;
  async.waterfall([
      /** get database */
        function getDb(callback) {
        _getConnectionService().getConnection(callback);
      },
      /** get the order code value */
        function execute(db, callback) {
        dbpointer = db;
        var coll = db.collection(collection);
        coll.findAndModify(
          qualification,  //query
          sort ? sort : [],  //sort
          update,         //update
          options,        //options
          callback
        );
      },
      function getData(data, callback) {
        onGetComplete(null, data);
        callback();
      }
    ],
    function onElse(error, value) {
      if (dbpointer)dbpointer.close();
    });
}

/**
 * execute a save
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _doGetTop(collection, query, topSize, sort, onComplete) {
  var dbpointer;
  var completed = false;
  var timing;
  async.waterfall([
      // get database
      function getDb(callback) {
        _getConnectionService().getConnection(callback);
      },
      // drop
      function execute(db, callback) {
        dbpointer = db;
        var coll = db.collection(collection);
        query = query || {};
        timing = _logQueryStart(collection, query);
        coll.find(query)
          .sort(sort)
          .limit(topSize)
          .toArray(function onDone(err, val) {
            if (val) {
              val = val.map(function (doc) {
                return doc._id;
              });
            }
            callback(err, val);
          });

      },
      // return
      function complete(data, callback) {
        _logQueryStop(collection, query, 0, timing);
        completed = true;
        onComplete(null, data);
        callback();
      }
    ],
    function onElse(error, value) {
      if (dbpointer) dbpointer.close();
      if (!completed) onComplete(error, value);
    });
}
/**
 * remove object by query
 * @param collection
 * @param query
 * @param options
 * @param onComplete
 * @private
 */
function _doRemove(collection, query, options, onComplete) {
  var dbpointer;
  var completed = false;
  var timing;
  async.waterfall([
      // get database
      function getDb(callback) {
        _getConnectionService().getConnection(callback);
      },
      // drop
      function execute(db, callback) {
        dbpointer = db;
        var coll = db.collection(collection);
        timing = _logQueryStart(collection, query);
        coll.deleteMany(query, options || {}, callback);
      },
      // return
      function complete(data, callback) {
        _logQueryStop(collection, query, 0, timing);
        completed = true;
        onComplete(null, data);
        callback();
      }
    ],
    function onElse(error, value) {
      if (dbpointer) dbpointer.close();
      if (!completed) onComplete(error, value);
    });
}

/**
 * execute a save
 * @param collection
 * @param query
 * @param onComplete
 * @private
 */
function _doSave(collection, query, onComplete) {
  _getConnectionService().getConnection(
    function onConnected(error, dbConnection) {
      if (error) {
        onComplete(error, null);
      } else {
        var listOut = [];
        var _collection = dbConnection.collection(collection);
        var key = _logQueryStart(collection, query);
        _collection.save(query,
          RETURN_ONE_OK,
          function onGet(err, obj) {
            _logQueryStop(collection, query, 0, key);
            dbConnection.close();
            onComplete(err, obj);
          }
        );
      }
    }
  );
}

/**
 * drop a collection
 * @param collection
 * @param onDrop
 * @private
 */
function _doDrop(collection, onDrop) {
  var dbpointer;
  var completed = false;
  var timing;
  async.waterfall([
      // get database
      function getDb(callback) {
        _getConnectionService().getConnection(callback);
      },
      // drop
      function execute(db, callback) {
        dbpointer = db;
        var coll = db.collection(collection);
        timing = _logQueryStart(collection, {'drop': 'drop'});
        coll.drop(callback);
      },
      // return
      function complete(data, callback) {
        _logQueryStop(collection, {'drop': 'drop'}, 0, timing);
        completed = true;
        onDrop(null, data);
        callback();
      }
    ],
    function onElse(error, value) {
      if (dbpointer) dbpointer.close();
      if (!completed) onDrop(error, value);
    });
}

/**
 * create a collection
 * @param collection
 * @param onCreate
 * @private
 */
function _doCreateCollection(collection, onCreate) {
  var dbpointer;
  var completed = false;
  var timing;
  async.waterfall([
      // get database
      function getDb(callback) {
        _getConnectionService().getConnection(callback);
      },
      // create
      function execute(db, callback) {
        dbpointer = db;
        timing = _logQueryStart(collection, {'create': 'create'});
        db.createCollection(collection, callback);
      },
      // return
      function complete(data, callback) {
        _logQueryStop(collection, {'create': 'create'}, 0, timing);
        completed = true;
        onCreate(null, {success: true});
        callback();
      }
    ],
    function onElse(error, value) {
      if (dbpointer) dbpointer.close();
      if (!completed) onCreate(error, value);
    });
}

/**
 * ensure index on collection
 * @param collection
 * @param index
 * @param options
 * @param onCreate
 * @private
 */
function _doCreateIndex(collection, index, options, onCreate) {
  var dbpointer;
  var completed = false;
  var timing;
  async.waterfall([
      // get database
      function getDb(callback) {
        _getConnectionService().getConnection(callback);
      },
      // create
      function execute(db, callback) {
        dbpointer = db;
        var coll = db.collection(collection);
        timing = _logQueryStart(collection, {'createIndex': index});
        coll.ensureIndex(index, options, callback);
      },
      // return
      function complete(data, callback) {
        _logQueryStop(collection, {'createIndex': index}, 0, timing);
        completed = true;
        onCreate(null, {success: true});
        callback();
      }
    ],
    function onElse(error, value) {
      if (dbpointer) dbpointer.close();
      if (!completed) onCreate(error, value);
    });
}

/**
 * start query log
 * @param collection
 * @param query
 * @private
 */
function _logQueryStart(collection, query) {
  //TODO improve logging
  let timingKey = MODULE_NAME + Math.random();
  let printQuery = PRINT_QUERY || process.env.PRINT_QUERY;
  if (printQuery) {
    if (collection != ERROR_COLLECTION) {
      var key = MODULE_NAME + ': [' + collection + '].' + tostring(query);
      console.log(MODULE_NAME + ': running query coded %s {[%s]}', timingKey, '[' + collection + '].' + tostring(query));
    }
    console.time(timingKey);
  }
  return timingKey;
}

function tostring(obj) {
  return util.inspect(obj, false, 2, true);
}
/**
 * stop query log
 * @param collection
 * @param query
 * @private
 */
function _logQueryStop(collection, query, size, timingKey) {
  //TODO improve logging
  let printQuery = PRINT_QUERY || process.env.PRINT_QUERY;
  if (printQuery) {
    if (collection != ERROR_COLLECTION) {
      var key = MODULE_NAME + ': [' + collection + '].' + tostring(query);
    }
    console.timeEnd(timingKey);
    console.log(key + ': ResultsSize[' + size + ']');
  }
}

/**
 * private getter for the cache service
 * @returns {*}
 * @private
 */
function _getCacheService() {
  return require('../objectFactory/ObjectFactory').cacheService;
}

/**
 * private getter for the cache service
 * @returns {*}
 * @private
 */
function _getConnectionService() {
  return require('../objectFactory/ObjectFactory').connectionService;
}


/** exports */

exports.doCreateCollection = _doCreateCollection;
exports.doCreateIndex = _doCreateIndex;
exports.doDrop = _doDrop;
exports.doGetTop = _doGetTop;
exports.doRemove = _doRemove;
exports.doSave = _doSave;
exports.runSelect = _runSelect;
exports.runOne = _runOne;
exports.runCachedSelect = _runCachedSelect;
exports.runAdvancedCachedSelect = _runAdvancedCachedSelect;
exports.runInsert = _runInsert;
exports.runUpdate = _runUpdate;
exports.runDistinct = _runDistinct;
exports.runCachedDistinct = _runCachedDistinct;
exports.runAggregate = _runAggregate;
exports.runFindModifiy = _runFindModifiy;
