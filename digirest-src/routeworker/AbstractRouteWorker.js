/**
 * Created by Aureliano on 27/09/2016.
 */
/**
 * simple status route worker
 * Author: Aureliano
 */


"use strict";


class AbstractRouteWorker{

    constructor(routeConf){
        this.conf = routeConf;
    }

    invoke(req,res){
        return;
    }
};

module.exports = AbstractRouteWorker;

