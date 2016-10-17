/**
 * waterfall executions of operations route worker
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
const MODULE_NAME = 'OperationsRouteWorker';
const AbstractRouteWorker = require('./AbstractRouteWorker');
const DEFAULT_PAYLOAD = 'OK';
const util = require('util');
const configurationsPool = {};


class OperationsRouteWorker extends AbstractRouteWorker {

  constructor(config) {
    super(config);
    console.log(JSON.stringify(config));
    this.collection = config['conf.collection'];
    //this.qualification = routeConfig['conf.qualification'].split(',');
    this.operations = config['conf.operations'].split(',');
    this.disablehtml = config['conf.disablehtml'];
    var configurationKey = config.method + '/' + config.pattern;
    configurationsPool[configurationKey] = this;
  }

  invoke(req, res) {

    //get the conf from the pool
    var self = OperationsRouteWorker.getObjectByRequest(configurationsPool, req);

    //operations param obj
    var paramObj = {};
    paramObj.request = req;
    paramObj.response = res;
    paramObj.payload = req.body;

    console.log(MODULE_NAME + ': operations ' + JSON.stringify(self.operations));
    console.log(MODULE_NAME + ': route ' + JSON.stringify(req.originalUrl));

    try {
      //start executions
      self._getOperationService().executeChain(
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
            } else if (!res.headersSent) {
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
            } else {
              if (res.statusCode != 304) {
                console.log(MODULE_NAME + ' header already sent but MANAGED');
                try {
                  res.end();
                } catch (ex) {
                  // DO NOTHING
                }
              }
            }
          } catch (exception) {
            // STOP ERROR PROPAGATION
            console.error(exception);
            exception.response = util.inspect(res);
            exception.headersent = res.headersSent;
            exception.originalError = util.inspect(exception);
            exception.request = util.inspect(req);
            console.log(MODULE_NAME + ': trace error');
            self._getErrorService().traceError(exception, MODULE_NAME);
            try {
              res.end();
            } catch (ex) {
              // IGNORE
            }
          }


        }
      );
    } catch (err) {
      console.error(err);
    }

  }

  static getObjectByRequest(configurationPool, req) {
    var method;
    if (req.route.methods.post)method = 'POST';
    else if (req.route.methods.get)method = 'GET';
    else if (req.route.methods.delete)method = 'DELETE';
    else if (req.route.methods.trace)method = 'TRACE';
    else if (req.route.methods.put)method = 'PUT';
    else if (req.route.methods.options)method = 'OPTIONS';
    else if (req.route.methods.head)method = 'HEAD';
    var key = method + '/' + req.route.path;
    return configurationPool[key];
  }


  _getOperationService() {
    return require('../objectfactory/ObjectFactory').operationService;
  }

  _getErrorService() {
    return require('../objectfactory/ObjectFactory').errorService;
  }

}

/** Exports */
module.exports = OperationsRouteWorker;