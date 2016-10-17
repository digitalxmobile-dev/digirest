/**
 * This file manage the route deployment
 * Author: Aureliano
 */

"use strict";

/** global requires and vars */
const MODULE_NAME = 'DiscoveryService';
const dynamicRoutes = [];
const fixedRoutes = [];
var dynamicRoot = '/';


/**
 * register a dynamic route
 * @param method
 * @param pattern
 * @private
 */
function _registerDynamicRoute(method, pattern) {
  let obj = {};
  obj.method = method;
  obj.pattern = pattern;
  dynamicRoutes.push(obj);
}

/**
 * register a fixed route
 * @param method
 * @param pattern
 * @private
 */
function _registerFixedRoute(method, pattern) {
  let obj = {};
  obj.method = method;
  obj.pattern = pattern;
  fixedRoutes.push(obj);
}

/**
 * return the array of readble routes
 * @returns {Array}
 * @private
 */
function _printRoutes() {
  let outStr = [];

  // fixed routes
  for (let i = 0; i < fixedRoutes.length; i++) {
    let obj = fixedRoutes[i];
    let str = obj.method + ':' + obj.pattern;
    outStr.push(str);
  }

  // dynamic routes
  for (let i = 0; i < dynamicRoutes.length; i++) {
    let obj = dynamicRoutes[i];
    let str = obj.method + ':' + dynamicRoot + obj.pattern;
    outStr.push(str);
  }

  return outStr;
}

/**
 * set the router hooks
 * @param root
 * @private
 */
function _setDynRoot(root) {
  dynamicRoot = root;
}

/** exports */
exports.setDynRoot = _setDynRoot;
exports.registerFixedRoute = _registerFixedRoute;
exports.registerDynamicRoute = _registerDynamicRoute;
exports.printRoutes = _printRoutes;
