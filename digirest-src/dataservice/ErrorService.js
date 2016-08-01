/**
 * Created by Aureliano on 29/02/2016.
 * This service manage oms errors
 */

'use strict';

/** global requires and vars */
var MODULE_NAME = 'ErrorService';
var ERROR_COLLECTION = '_Errors';
var STARTUP_COLLECTION = '_Reboot';
var ObjectService = require('../../digirest-src/objectFactory/ObjectFactory').objectService;
var ErrorService = require('./ErrorService');

/**
 * trace library errors
 * @param object
 * @private
 */
function _traceError(object,modulename){
    try {
        object.dt_insert = new Date();
        object.cd_module = modulename || MODULE_NAME;
        _getObjectService().insertObject(
            object,
            ERROR_COLLECTION,
            function onComplete(err, val) {
                if (err) {
                    console.error(err);
                }
            }
        );
    }catch(err){
        //donothing
    }
}

/**
 * trace library reboots
 * @param object
 * @param modulename
 * @private
 */
function _startup(object,modulename){
    try {
        if(!process.env.LOCAL) {
            object.dt_insert = new Date();
            object.cd_module = modulename || MODULE_NAME;
            _getObjectService().insertObject(
                object,
                STARTUP_COLLECTION,
                function onComplete(err, val) {
                    if (err) {
                        console.error(err);
                    }
                }
            );
        }
    }catch(err){
        //donothing
    }
}

/**
 * private getter for the runquery service
 * @returns {*}
 * @private
 */
function _getObjectService(){
    if(!ObjectService) {
        ObjectService = require('../../digirest-src/objectFactory/ObjectFactory').objectService;
    }
    return ObjectService;
}

/** Exports */
exports.traceError=_traceError;
exports.startup=_startup;