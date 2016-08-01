/**
 * WARNING: DO NOT ALLOCATE THIS FILE
 * Author: Aureliano
 */

var MODULE_NAME = 'AbstractInsertWorker';
var runQueryService = require('../objectfactory/ObjectFactory').runQueryService;

/**
 * Execute a insert
 * @param self
 * @param query
 * @param res
 * @private
 */
function _runInsert(self,req,res){
    console.log('insert ' + JSON.stringify(req.body));
    _getRunQueryService().runInsert(
        self.collection,
        req.body,
        function onComplete(error, insertRes) {
            if (insertRes) {
                if(insertRes.result.ok===1){
                    res.status(201);
                    res.send(JSON.stringify(insertRes.ops));
                }else{
                    res.status(409);
                    res.sen
                }
            } else {
                res.status(500);
                res.send(error);
            }
        });
}

/**
 * return the run queryservice
 * @returns {*}
 * @private
 */
function _getRunQueryService(){
    if(runQueryService){
        return runQueryService;
    }else{
        return require('../objectfactory/ObjectFactory').runQueryService;
    }
}


/** exports */
module.exports._runInsert=_runInsert;