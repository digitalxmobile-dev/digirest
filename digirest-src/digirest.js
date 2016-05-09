/**
 * Created by Aureliano on 09/05/16.
 */


const objectFactory = require(objectFactory/ObjectFactory);

/**
 * init digirest
 * @param expressapp
 * @param router
 * @param httpserver
 * @param propertiesLocation
 */
function init(expressapp, router, httpserver, propertiesLocation){
    "use strict";
    objectFactory.init_digirest(expressapp,router,httpserver,propertiesLocation);
}

/**
 * register route to the discovery service
 * @param method
 * @param route
 */
function registerRoute(method,route){
    "use strict";
    objectFactory.discoveryService.registerFixedRoute(method,route);
}

/** EXPORTS */
exports.init = init;
exports.registerRoute = registerRoute;