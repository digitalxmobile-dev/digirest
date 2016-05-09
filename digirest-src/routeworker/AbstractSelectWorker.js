/**
 * WARNING: DO NOT ALLOCATE THIS FILE
 * Author: Aureliano
 */

var MODULE_NAME = 'AbstractSelectWorker';
var runQueryService = require('../objectfactory/ObjectFactory').runQueryService;

/**
 * Execute a select
 * @param self
 * @param query
 * @param res
 * @private
 */
function _runSelect(self,query,res){

    // execute cached
    if(self.cache) {
        //run select cached
        var time;

        // manage forever
        if (self.cachetime === 'forever') {
            time = null;
        } else {
            time = self.cachetime;
        }

        // run select with cache
        _getRunQueryService().runCachedSelect(
            self.collection,
            query,
            time,
            function onComplete(error, listOut) {
                if (listOut) {
                    res.send(listOut);
                } else {
                    res.send(error);
                }
            });

    }else {

        // run select without cache
        _getRunQueryService().runSelect(
            self.collection,
            query,
            function onComplete(error, listOut) {
                if (listOut) {
                    res.send(listOut);
                } else {
                    res.send(error);
                }
            });
    }

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
module.exports._runSelect=_runSelect;