/**
 * Middleware for request tracing
 * Author: Aureliano
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'TracingMiddleware';
var ParseService = require('../objectfactory/ObjectFactory').parseService;

// the middleware function
module.exports = function () {

    return function (req, res, next) {

        //parse obj
        var parseObj = {}

        //http method
        parseObj.method = req.method;

        //url invoked (only postfix)
        parseObj.originalUrl = req.originalUrl;

        ////raw headers array NULL IN AZURE
        //parseObj.rawHeaders = JSON.stringify(req.rawHeaders);

        //start time
        parseObj.startTime = req._startTime.toString();

        // req body
        parseObj.body = {};
        if(req.body) {
            var keys = Object.keys(req.body);
            for (var iterator in keys) {
                var key = keys[iterator];
                parseObj.body[key] = req.body[key];
            }
        }
        parseObj.body = JSON.stringify(parseObj.body);

        // req query
        parseObj.query = {}
        if(req.query) {
            keys = Object.keys(req.query);
            for (var iterator in keys) {
                var key = keys[iterator];
                parseObj.query[key] = req.query[key];
            }
        }
        parseObj.query = JSON.stringify(parseObj.query);
        parseObj.unit = process.env.UNITCODE;


        //console.log('TRACING:::[%s]:[%s]:[%s]:[%s]:::::',parseObj.startTime,parseObj.method,parseObj.originalUrl,parseObj.rawHeaders);
        //console.log('TRACING REQ:::[%s]:[%s]::::::',parseObj.body, parseObj.query);

        // parse key validation
        for (var key in parseObj) {
            if (typeof key !== 'string' || typeof parseObj[key] !== 'string') {
                console.log('PARSE mabybe cannot log ' + key + parseObj[key]);
            }
        }


        // invoke parse
        try {
            var ps = _getParseService();
            ps.trackAnalytics("request",parseObj);
        }
        catch (e) {
            console.log(MODULE_NAME + ": error invoking Parse " + JSON.stringify(e) + " " + e.message + " "+ JSON.stringify(parseObj));
        }
        finally {
            // go to next ANYWAY
            next();
        }

    }

};

/**
 * getter for the parse service
 * @returns {*}
 * @private
 */
function _getParseService(){
    if(!ParseService){
        ParseService = require('../objectfactory/ObjectFactory').parseService;
    }
    return ParseService;
}