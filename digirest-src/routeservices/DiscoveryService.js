/**
 * This file manage the route deployment
 * Author: Aureliano
 */

"use strict";

/** global requires and vars */
var MODULE_NAME = 'DiscoveryService';
var dynamicRoutes=[];
var dynamicRoot='/';
var fixedRoutes=[];

/**
 * register a dynamic route
 * @param method
 * @param pattern
 * @private
 */
function _registerDynamicRoute(method,pattern){
    var obj= {};
    obj.method=method;
    obj.pattern=pattern;
    dynamicRoutes.push(obj);
}

/**
 * register a fixed route
 * @param method
 * @param pattern
 * @private
 */
function _registerFixedRoute(method,pattern){
    var obj= {};
    obj.method=method;
    obj.pattern=pattern;
    fixedRoutes.push(obj);
}

/**
 * return the array of readble routes
 * @returns {Array}
 * @private
 */
function _printRoutes(){
    var outStr=[];

    // fixed routes
    for (var i = 0; i<fixedRoutes.length; i++){
        var obj = fixedRoutes[i];
        var str = obj.method + ':' + obj.pattern;
        outStr.push(str);
    }

    // dynamic routes
    for (var i = 0; i<dynamicRoutes.length; i++){
        var obj = dynamicRoutes[i];
        var str = obj.method + ':' + dynamicRoot +  obj.pattern;
        outStr.push(str);
    }

    return outStr;
}

/**
 * set the router hooks
 * @param root
 * @private
 */
function _setDynRoot(root){
    dynamicRoot = root;
}

/** exports */
exports.setDynRoot=_setDynRoot;
exports.registerFixedRoute=_registerFixedRoute;
exports.registerDynamicRoute=_registerDynamicRoute;
exports.printRoutes=_printRoutes;
