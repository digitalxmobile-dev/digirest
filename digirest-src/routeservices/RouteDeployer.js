/**
 * This file manage the route deployment
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'RouteDeployer';
var LEGACY_ALL_DYN_ROUTES = 'routes.dynamic.all';
var MASTER_DYN_ROUTES = 'routes.dynamic.master';
var SLAVE_DYN_ROUTES = 'routes.dynamic.slave.';
var ROUTE_PREFIX = 'route.';
var OPERATION_ROUTE = 'src/digirest-src/routeworker/OperationsRouteWorker';
var securityMiddleware = require('../objectFactory/ObjectFactory').securityMiddleware;
var async = require('async');

/**
 * deploy routes configured dynamically
 * @param expressApp
 * @param configurationService
 * @param onComplete
 * @private
 */
function _deployDynamicRoutes(expressApp, onComplete) {
  console.log(MODULE_NAME + ' : starting routes deploy');

  // local array
  var routesArray;

  async.waterfall([
      // try get the route in the old fashion way (all in one row)
      function tryGetLegacyRoutes(wfcallback) {
        _getConfigurationService().getPropertiesArray(LEGACY_ALL_DYN_ROUTES, wfcallback);
      },
      // get the master if no legacy
      function tryGetMasterRoutes(returnedArray, wfcallback) {
        if (returnedArray && returnedArray.length > 0) {
          // there are legacy routes
          routesArray = returnedArray;
          wfcallback(null, null);
        } else {
          _getConfigurationService().getPropertiesArray(MASTER_DYN_ROUTES, wfcallback);
        }
      },
      // manage slaves OR deploy routes
      function tryGetSlaveRoutes(returnedArray, wfcallback) {
        if (!routesArray && returnedArray) {
          // if the are slaves, cycle and deploy
          async.each(
            returnedArray,
            function getRoutesAndDeploy(slaveName, eacallback) {
              async.waterfall([
                  // get the slave configurations
                  function getRoutes(innerwfcallback) {
                    _getConfigurationService().getPropertiesArray(SLAVE_DYN_ROUTES + slaveName, innerwfcallback);
                  },
                  // deploy the routes
                  function deployRoutes(slaveRoutesArray, innerwfcallback) {
                    _deployRoutesArray(slaveRoutesArray, expressApp, _getConfigurationService(), innerwfcallback);
                  }
                ],
                function onOK(error, val) {
                  if (error) {
                    console.error(error);
                  }
                });
              eacallback(null, null);
            }
          );
          wfcallback(null, null);
        } else {
          _deployRoutesArray(routesArray, expressApp, _getConfigurationService(), wfcallback);
        }
      },
      function initOperations(success, wfcallback) {
        _getOperationService().initDynamicOperations(wfcallback);
      }
    ],
    // fallback
    function onSomething(error, success) {
      if (success) {
        console.log(MODULE_NAME + ': operations loaded');
        onComplete(null, success);
      } else if (error) {
        var message = MODULE_NAME + ': error on operation/routes loading ' + JSON.stringify(error);
        console.log(message);
        onComplete(error || new Error(message), success);
      }
    });
}

/**
 * Deploy an array of routes
 * @param routesArray
 * @param onArrayRoutesDeployed
 * @private
 */
function _deployRoutesArray(routesArray, expressApp, configurationService, onArrayRoutesDeployed) {
  if (routesArray) {
    routesArray.forEach(
      function (routeName) {
        _deploySingleRoute(expressApp, configurationService, routeName);
      });
  } else {
    console.log(MODULE_NAME + ': no routes to deploy found');
  }
  onArrayRoutesDeployed(null, true);
}

/**
 * deploy routes configured dynamically
 * @param expressApp
 * @param configurationService
 * @param onComplete
 * @private
 * @deprecated
 */
function _deployRoutes(expressApp, configurationService, onComplete) {
  console.log(MODULE_NAME + ' : starting routes deploy');
  if (expressApp && onComplete && configurationService && configurationService.getPropertiesArray) {
    configurationService.getPropertiesArray(ALL_DYN_ROUTES,
      function (error, routesArray) {
        var success = false;
        if (error) {
          onComplete(error, success);
        } else if (routesArray) {
          _deployRoutesArray(routesArray, expressApp, configurationService, function onOk(err, res) {
          })
          _getOperationService().initOperations(
            function onOperationLoaded(error, succes) {
              if (success) {
                console.log(MODULE_NAME + ': operations loaded');
              } else if (error) {
                var message = MODULE_NAME + ': error on operation loading ' + JSON.stringify(error);
                console.log(message);
                onComplete(error(message), succes);
              }
            }
          )
        } else {
          console.log(MODULE_NAME + ': _deployRoutes no dynamic routes found');
          success = true;
          onComplete(null, success);
        }
      });
  } else {
    //REMOVEME debug purpose only
    if (expressApp)console.log('expressapp');
    if (onComplete)console.log('onComplete');
    if (configurationService)console.log('configurationService');
    if (configurationService.getPropertiesArray)console.log(' configurationService.getPropertiesArray');
    console.log(MODULE_NAME + ' :routes deploy aborted');
  }
}

/**
 * deploy a single route
 * @param router
 * @param configurationService
 * @param routeName
 * @private
 */
function _deploySingleRoute(router, configurationService, routeName) {
  configurationService.getPropertiesJsonByRoot(ROUTE_PREFIX + routeName,
    function onGet(error, routeConf) {
      console.log(MODULE_NAME + ' deploying route: ' + routeName + '[' + JSON.stringify(routeConf) + ']');

      // instantiate the module for the route management
      var moduleRoute = routeConf.module || OPERATION_ROUTE;
      var Worker = require(_getFileService().getPath(moduleRoute));
      var invoke = null;

      // eventually skip
      if (routeConf.skip == 'enabled') {
        console.log(MODULE_NAME + ': %s skipped by conf', routeConf.pattern);

      } else {

        // apply protection
        if (routeConf.protected) {
          if (!process.env.DISABLEJWT) {
            router.use(routeConf.pattern, _getSecurityMiddleware());
          }
        }

        // apply special middlewares
        if (routeConf.middleware) {
          var middlewareList = routeConf.middleware.split(',');
          for (var i = 0; i < middlewareList.length; i++) {
            var Middleware = require(_getFileService().getPath(middlewareList[i]));
            router.use(routeConf.pattern, Middleware);
          }
        }

        // frequent error
        if (routeConf.patter) {
          console.error('WARNING: RIGHT USE IS PATTERN, NOT PATTER')
        }

        // if needed, allocate a new instance of the worker
        //if(routeConf.newinstance){
        try {
          var instance = new Worker(routeConf);
          invoke = instance.invoke;
        } catch (legacyCodeError) {
          if (legacyCodeError.message === 'object is not a function' || legacyCodeError.message === 'Worker is not a function') {
            invoke = Worker.invoke;
          } else {
            console.log(routeConf);
            throw legacyCodeError;
          }
        }

        if (routeConf.method === 'GET') {
          router.get(routeConf.pattern, invoke);
        } else if (routeConf.method === 'POST') {
          router.post(routeConf.pattern, invoke);
        } else if (routeConf.method === 'DELETE') {
          router.delete(routeConf.pattern, invoke);
        } else if (routeConf.method === 'PUT') {
          router.put(routeConf.pattern, invoke);
        }

        require('../objectFactory/ObjectFactory').discoveryService.registerDynamicRoute(routeConf.method, routeConf.pattern);
      }
    });
}

/**
 * getter for file service
 * @returns {*}
 * @private
 */
function _getFileService() {
  return require('../objectFactory/ObjectFactory').fileService;
}

/**
 * getter for operation service
 * @returns {*}
 * @private
 */
function _getOperationService() {
  return require('../objectFactory/ObjectFactory').operationService;
}

/**
 * getter for security middleware
 * @returns {*}
 * @private
 */
function _getSecurityMiddleware() {
  return securityMiddleware = require('../objectFactory/ObjectFactory').securityMiddleware;
}

/**
 * getter for configuration service
 * @returns {*}
 * @private
 */
function _getConfigurationService() {
  return require('../objectFactory/ObjectFactory').configurationService;
}


/** exports */
exports.deployRoutes = _deployRoutes;
exports.deployDynamicRoutes = _deployDynamicRoutes;
