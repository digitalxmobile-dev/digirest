/**
 * waterfall executions of operations route worker
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'OperationsRouteWorker';
var DEFAULT_PAYLOAD = 'OK';
var OperationService = require('../objectfactory/ObjectFactory').operationService;
var ErrorService = require('../objectfactory/ObjectFactory').errorService;
var util = require('util');
var configurationsPool={};

/**
 * Constructor
 * @param routeConfig
 * @constructor
 */
function OperationsRouteWorker (routeConfig){
    console.log(JSON.stringify(routeConfig));
    this.collection = routeConfig['conf.collection'];
    //this.qualification = routeConfig['conf.qualification'].split(',');
    this.operations = routeConfig['conf.operations'].split(',');
    this.disablehtml = routeConfig['conf.disablehtml'];
    var configurationKey = routeConfig.method + '/' + routeConfig.pattern;
    configurationsPool[configurationKey]=this;
}


/**
 * the invoke method
 * @param req
 * @param res
 */
OperationsRouteWorker.prototype.invoke = function(req,res) {

    //get the conf from the pool
    var self = __getObjectByRequest(configurationsPool,req);

    //operations param obj
    var paramObj = {};
    paramObj.request=req;
    paramObj.response=res;
    paramObj.payload=req.body;

    console.log(MODULE_NAME + ': operations ' + JSON.stringify(self.operations));
    console.log(MODULE_NAME + ': route '  + JSON.stringify(req.originalUrl));

    try {
        //start executions
        _getOperationService().executeChain(
            self.operations,
            paramObj,
            function onOperationsComplete(error, resultObj) {
                try {
                    if (error && !res.headersSent) {
                        var errorMessage;
                        if (resultObj && resultObj.errorMessage) {
                            errorMessage = resultObj.errorMessage;
                        } else if (error.message && !process.env.HIDE_ERRORS) {
                            errorMessage = error.message;
                        }
                        console.log(MODULE_NAME + ': ' + error);
                        if (res.statusCode === 400) {
                            //if was alredy set do nothing
                            var msg = errorMessage ? errorMessage : 'Bad Request';
                            res.json({error: msg});
                            res.send();
                        } else if (res.statusCode === 401) {
                            var msg = errorMessage ? errorMessage : 'Not Authorized';
                            res.json({error: msg});
                            res.send();
                        } else if (res.statusCode === 409) {
                            var msg = errorMessage ? errorMessage : 'Conflict';
                            res.json({error: msg});
                            res.send();
                        } else {
                            var msg = errorMessage ? errorMessage : 'Unknown Error';
                            res.json({error: msg});
                            res.statusCode = 500;
                            res.send();
                        }
                    } else if (!res.headersSent){
                        res.status = (resultObj.status) ? resultObj.status : 200;
                        var payload = (resultObj.payload) ? resultObj.payload : DEFAULT_PAYLOAD;
                        if (!resultObj.sendRaw) {
                            res.setHeader('Content-Type', 'application/json; charset=utf-8');
                            res.type('json');
                            res.json(payload);
                            res.send();
                        } else {
                            res.send(payload);
                        }
                    }else {
                        if(res.statusCode != 304) {
                            console.log(MODULE_NAME + ' header already sent but MANAGED');
                            try {
                                res.end();
                            }catch(ex){
                                // DO NOTHING
                            }
                        }
                    }
                }catch(exception){
                    // STOP ERROR PROPAGATION
                    console.error(exception);
                    exception.response = util.inspect(res);
                    exception.headersent = res.headersSent;
                    exception.originalError = util.inspect(exception);
                    exception.request = util.inspect(req);
                    console.log(MODULE_NAME + ': trace error');
                    _getErrorService().traceError(exception,MODULE_NAME);
                    try{
                        res.end();
                    }catch(ex){
                        // IGNORE
                    }
                }


            }
        );
    } catch(err){
        console.error(err);
    }

}

/**
 * return the run OperationService
 * @returns {*}
 * @private
 */
function _getOperationService(){
    if(!OperationService){
        OperationService = require('../objectfactory/ObjectFactory').operationService;
    }else{
        return OperationService;
    }
}

/**
 * private getter for error service
 * @returns {*}
 * @private
 */
function _getErrorService(){
    if(!ErrorService){
        ErrorService = require('../objectfactory/ObjectFactory').errorService;
    }else{
        return ErrorService;
    }
}

/**
 * get the configuration
 * @param configurationPool
 * @param req
 * @returns {*}
 * @private
 */
function __getObjectByRequest(configurationPool,req){
    var method;
    if(req.route.methods.post)method='POST';
    else if(req.route.methods.get)method='GET';
    else if(req.route.methods.delete)method='DELETE';
    else if(req.route.methods.trace)method='TRACE';
    else if(req.route.methods.put)method='PUT';
    else if(req.route.methods.options)method='OPTIONS';
    else if(req.route.methods.head)method='HEAD';
    var key = method + '/' + req.route.path;
    return configurationPool[key];
}

/** Exports */
module.exports=OperationsRouteWorker;