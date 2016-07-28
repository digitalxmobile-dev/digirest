/**
 * simple version route worker
 * Author: Aureliano
 */

"use strict";


exports.invoke= function(req,res){
    var ConfigurationService = require('../objectFactory/ObjectFactory').configurationService;
    if(process.env.IOS_V){
        var obj = {};
        obj.version = process.env.IOS_V;
        res.send(obj);
    }else {
        ConfigurationService.getProperty(
            'app.mobile.ios.version',
            function onGet(error, value) {
                if (error) {
                    res.status(500);
                    res.send(error);
                } else {
                    var obj = {};
                    obj.version = value;
                    res.send(obj);
                }
            });
    }
}