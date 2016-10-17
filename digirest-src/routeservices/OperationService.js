/**
 * Created by Aureliano on 14/09/2015.
 */
/**
 * This file manage the async operations chains
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'OperationService';
const LEGACY_ALL_OP_KEY = 'operations.all.list';
const MASTER_OP_KEY = 'operations.configuration.master';
const SLAVE_OP_KEY = 'operations.configuration.slave.';
const OP_ROOT_KEY = 'operation.';
const CloneFactory = require('cloneextend');
const async = require('async');
var operationsPool = {};


/**
 * Init the operations defined in the properties file
 * @private
 */
function _initDynamicOperations(onInitComplete) {
  var success = true;
  if (operationsPool && operationsPool.length > 0) {
    onInitComplete(null, success);
  } else {
    async.waterfall([
        // get the master operations list
        function getMasterProperty(wfcallback) {
          _getConfigurationService().getPropertiesArray(MASTER_OP_KEY, wfcallback);
        },
        // get the slaves operation list
        function getSlavesProperty(masterArray, wfcallback) {
          if (masterArray) {
            // load each slave
            async.each(
              masterArray,
              function _initSlave(slavename, eacallback) {
                _initOperations(eacallback, SLAVE_OP_KEY + slavename);
              },
              function _slaveComplete(err, val) {
                if (!err) val = val || true;
                wfcallback(err, val);
              }
            )
          } else {
            // no master = legacy operations
            _initOperations(wfcallback);
          }
        }
      ],
      function onFinish(err, val) {
        onInitComplete(err, val);
      }
    );
  }
}

/**
 * Init the operations defined in the properties file
 * @private
 */
function _initOperations(onInitComplete, operationsGroup) {
  var success = true;
  if (operationsPool && operationsPool.length > 0 && !operationsGroup) {
    onInitComplete(null, success);
  } else {
    var operationsKey = operationsGroup ? operationsGroup : LEGACY_ALL_OP_KEY;
    // get all operations name
    _getConfigurationService().getPropertiesArray(
      operationsKey,
      function onGetComplete(error, valueArrray) {
        if (valueArrray) {
          for (var i = 0; i < valueArrray.length; i++) {
            // get operation conf
            _getConfigurationService().getPropertiesJsonByRoot(
              OP_ROOT_KEY + valueArrray[i],
              function onGetConf(error, confObj) {
                _addOperationToPool(confObj, valueArrray[i]);
              });
          }
          onInitComplete(null, success);
        } else if (error) {
          var message = MODULE_NAME + ': cannot get operations loaded, no ' + operationsKey + ' property found';
          console.log(message);
          onInitComplete(new Error(message), false);
        } else {
          console.log(MODULE_NAME + ': no operations defined');
          onInitComplete(null, true);
        }
      });
  }
}

/**
 *
 * @param confObj
 * @param opnameFromConf
 * @private
 */
function _addOperationToPool(confObj, opnameFromConf) {
  if (confObj) {
    var operation = {};
    operation.conf = confObj;
    try {
      operation.modulepath = confObj.module;
      operation.module = require(_getFileService().getPath(confObj.module));
    } catch (error) {
      console.log(MODULE_NAME + ': error loading ' + confObj.module + ' for ' + confObj.opname);
      throw error;
    }
    operation.functionname = confObj.function;
    // Improvement: fallback to default function 'invoke'
    if (!operation.functionname) {
      operation.functionname = 'invoke';
    }
    operation.name = confObj.opname;
    operation.params = confObj.params;
    // add the operation to the pool
    operationsPool[confObj.opname] = operation;
    console.log(MODULE_NAME + ': ' + confObj.opname + ' loaded OK');

  } else {
    console.log(MODULE_NAME + ': cannot get operation ' + opnameFromConf + ' loaded, no conf');
  }
}

/**
 * run a single operation by name
 * @param operationName
 * @param funcParamObj
 * @param onExecuteComplete
 * @private
 */
function _executeSingleOperation(operationName, funcParamObj, onExecuteComplete) {
  var operation = operationsPool[operationName];
  if (operation) {
    // get the module
    var module = operation.module;
    // get the functionname
    var functionname = operation.functionname;
    funcParamObj.operationRef = operation;
    //invoke by reflection
    module[functionname](funcParamObj, onExecuteComplete);
  } else {
    var message = MODULE_NAME + ': cannot get operation ' + operationName + ' not defined';
    console.log(message);
    onExecuteComplete(new Error(message));
  }
}

/**
 * Execute the operations chained
 * @param operationObj
 * @param funcParamObj
 * @param onFinalExecutionsComplete
 * @private
 */
function _executeChainedOperation(operationObj, funcParamObj, onFinalExecutionsComplete) {
  if (operationObj) {
    if (funcParamObj && funcParamObj.timingKey) {
      _logOPStop(funcParamObj.timingKey);
    }
    console.log(MODULE_NAME + ': lauchin ' + operationObj.name);
    funcParamObj.timingKey = _logOPStart(operationObj.name);

    var module = operationObj.module;
    // get the functionname
    var functionname = operationObj.functionname;
    // pass the operation itself as obj into the param
    funcParamObj.operationRef = operationObj;
    //invoke by reflection
    try {
      module[functionname](
        funcParamObj,
        function onOperationComplete(error, resultObj) {
          if (resultObj && !error) {
            // the result of the op is the parameter of the next op
            var paramObj = resultObj;
            // run the next operation
            _executeChainedOperation(operationObj.next, paramObj, onFinalExecutionsComplete);
          } else {
            if (paramObj && paramObj.timingKey) {
              _logOPStop(funcParamObj.timingKey);
            }
            onFinalExecutionsComplete(error, funcParamObj);
          }
        });
    } catch (configurationError) {
      // add verbosity and rethrow
      if (configurationError.message === 'undefined is not a function') {
        console.log(MODULE_NAME + ': error due to (probabily) missing or wrong configuration for ' + operationObj.name);
        console.error(configurationError);
      }
      throw configurationError;
    }
  } else {
    // if no op is defined, we are at the end of the chain
    if (funcParamObj && funcParamObj.timingKey) {
      _logOPStop(funcParamObj.timingKey);
    }
    console.log(MODULE_NAME + ': end of chain');
    onFinalExecutionsComplete(null, funcParamObj);
  }


}

/**
 * Sync function - getter for operation by name
 * @param name
 * @returns {*}
 */
function _getOperationByName(name) {
  if (operationsPool) {
    var localOp = operationsPool[name];
    if (!localOp) {
      throw Error(operationNamesChain[i] + ' OPERATION NOT FOUND');
    }
    var returnOp = CloneFactory.clone(localOp);
    return returnOp;
  } else {
    var message = MODULE_NAME + ': operations not loaded';
    Console.log(message);
    var error = new Error(message);
  }
}
/**
 *
 * @param operationNamesChain the array of all operations in order
 * @param funcParamObj the obj to be passed to the chain
 * @param onChainComplete the callback to be called at the end of the chain
 * @private
 */
function _executeChain(operationNamesChain, funcParamObj, onChainComplete) {
  if (operationsPool) {
    var root;
    var previous;
    // create the chained operations
    for (var i = 0; i < operationNamesChain.length; i++) {

      // clone the op
      var localOp = operationsPool[operationNamesChain[i]];
      if (!localOp) {
        console.log(MODULE_NAME, ': ERROR ', operationNamesChain[i], ' OPERATION NOT FOUND ');
        throw Error('[' + operationNamesChain[i] + '] OPERATION NOT FOUND - [operationsPool size ' + operationsPool ? operationsPool.length : ' UNALLOCATED ');
      }
      var chainOp = CloneFactory.clone(localOp);

      // manage the root
      if (!root) {
        root = chainOp;
      }

      // link me to the previous
      if (previous) {
        previous.next = chainOp;
      }

      // close the loop being previous
      previous = chainOp;
    }

    // run!
    _executeChainedOperation(root, funcParamObj, onChainComplete);
  } else {
    var message = MODULE_NAME + ': operations not loaded';
    Console.log(message);
    var error = new Error(message);
    onChainComplete(error);
  }
}

/**
 * start query log
 * @param collection
 * @param query
 * @private
 */
function _logOPStart(opname) {
  //TODO improve logging
  var timingKey;
  if (process.env.PRINT_OP_TIME) {
    timingKey = opname;
    console.time(timingKey);
  }
  return timingKey;
}

/**
 * stop query log
 * @param collection
 * @param query
 * @private
 */
function _logOPStop(key) {
  //TODO improve logging
  if (process.env.PRINT_OP_TIME) {
    console.timeEnd(key);
  }
}

/**
 * get the configuration service
 * @returns {*}
 * @private
 */
function _getConfigurationService() {
  return require('../objectfactory/ObjectFactory').configurationService;
}

/**
 * get the file service
 * @returns {*}
 * @private
 */
function _getFileService() {
  return require('../objectfactory/ObjectFactory').fileService;
}


/** exports */
exports.initOperations = _initOperations
exports.initDynamicOperations = _initDynamicOperations;
exports.executeChain = _executeChain;
exports.executeSingleOperation = _executeSingleOperation;
exports.getOperationByName = _getOperationByName;

