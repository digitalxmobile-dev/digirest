/**
 * Created by Aureliano on 29/10/2015.
 * Route that export a local db to json
 */
"use strict";

var MODULE_NAME = 'ExportLocalDbWorker';
var LocalDbService = require('../objectfactory/ObjectFactory').localDbService;


/**
 * invoke function
 * @param req
 * @param res
 * @private
 */
function _invoke(req,res){
    var collection = req.params.collection;
    if(!collection){
        res.status(400);
        res.send();
    }else{
        _getLocalDbService().exportData(
            collection,
            function onExport(error,value) {
                if(error){
                    res.status(500);
                    res.send(error.message);
                }else{
                    res.send(value);
                }
            });
    }
}

/**
 * getter for local db service
 * @returns {*}
 * @private
 */
function _getLocalDbService(){
    if(!LocalDbService){
        LocalDbService =  require('../objectfactory/ObjectFactory').localDbService;
    }
    return LocalDbService;
}

/** exports */
exports.invoke=_invoke;