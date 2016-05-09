/**
 * This file is the singleton object factory
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ObjectFactory';

/** exports - proto dependency injection here - order matters*/

// cache
var cacheService = require('memory-cache');
exports.cacheService = cacheService;

// configuration manager
const ConfigurationService = require('../configurationservice/BasicConfigurationService');
const configurationService = ConfigurationService.instance;
exports.configurationService = configurationService;

// route deploy service
var routeDeployer = require('../routeservices/RouteDeployer');
exports.routeDeployer = routeDeployer;
// simple route discovery service
var discoveryService = require('../routeservices/DiscoveryService');
exports.discoveryService = discoveryService;
// operation manager service
var operationService = require('../routeservices/OperationService');
exports.operationService = operationService;
// database connection service
var connectionService = require('../connectionservice/MongoConnectionService');
exports.connectionService = connectionService;
// query executions service
var runQueryService = require('../dataservice/RunQueryService');
exports.runQueryService = runQueryService;
// db object management service
var objectService = require('../dataservice/ObjectService');
exports.objectService = objectService;
// filesystem manager and utility
var fileService = require('../fileservice/FileService');
exports.fileService = fileService;
// security service
var securityService = require('../security/SecurityService');
exports.securityService = securityService;
// security middleware
exports.securityMiddleware = require('../security/SecurityJwtMiddleware');
// WIP logger
var logger = require('../logger/WinstonLogger');
exports.logger = logger;
// Error Service
var errorService = require('../dataservice/ErrorService');
exports.errorService = errorService;
// Social Login Service
var socialLoginService = require('../integrations/SocialLoginService');
exports.socialLoginService = socialLoginService;

// Web sockets service
var webSocketService = require('../websocket/WebSocketService');
exports.webSocketService = webSocketService;
// User Web sockets service
var webSocketUserService = require('../websocket/WebSocketUserService');
exports.webSocketUserService = webSocketUserService;
// Push Service
var pushService = require('../integrations/PushService');
exports.pushService = pushService;

/** Init the configuration Service */
function _init_configuration(propertiesLocation){
    // init config service
    logger.info(MODULE_NAME + ': config preload');
    configurationService.init(propertiesLocation,function(error,success){
        if(success){
            configurationService.getProperty('app.util.ping',function onOK(error,value){
                if(value && value==='PING'){
                    logger.info(MODULE_NAME + ': config load OK');
                }else if (error){
                    logger.error(MODULE_NAME  + ': config load ERROR' + error.toString());
                }else{
                    logger.info(MODULE_NAME + ': config load NOK with no error');
                }
            });
        }
    });
}

/** Init the configuration Routes */
function _init_routes(router){
    var routesDeployed = false;
    logger.info(MODULE_NAME + ': routes preload');
    routeDeployer.deployDynamicRoutes(router,
        function onLoad(error,success) {
            if (success) {
                logger.info(MODULE_NAME + ': routes loaded');
            } else {
                logger.error(MODULE_NAME + ': error loading routes ' + JSON.stringify(error));
            }
            routesDeployed = true;
            logger.info(MODULE_NAME + ': routes postload');
            app.use('/api',router);
        });
}

/** Init the mongo db */
function _init_db_connections(){
    connectionService.testConnection(
        function onComplete(error){
            if(error){
                logger.error(MODULE_NAME + ': error testing the connection to database ' + JSON.stringify(error));
            }else{
                logger.info(MODULE_NAME + ': ping connection to database success');
                errorService.startup({},MODULE_NAME);
            }
        });
}

/** Init the websockets */
function _init_websockets(httpServer){
    webSocketService.init(
        httpServer,
        function onComplete(error){
            if(error) {
                logger.error(MODULE_NAME + ': error in websocket init ' + JSON.stringify(error));
            }else{
                logger.info(MODULE_NAME + ': websocket init OK')
            }
        }
    );
}

/** EXPORTS */
exports.init_routes = _init_routes;
exports.init_db = _init_db_connections;
exports.init_conf = _init_configuration;
exports.init_websockets = _init_websockets;

/** INIT THE DIGIREST OPERATIONS */
exports.init_digirest = function _init_digirest(app,router,httpServer,propertiesLocation){

    // init digirest
    _init_configuration(propertiesLocation);
    _init_routes(router);
    _init_db_connections();
    _init_websockets(httpServer);

    // init express
    app.use('/api', router);
    app.disable('x-powered-by');
    discoveryService.setDynRoot('/api');

    // if fatus configured, init fatus
    if(process.env.FATUS_QUEUE_NAME) {
        let fatus = require('fatusjs').instance;
        fatus.addWorker();
    }
}