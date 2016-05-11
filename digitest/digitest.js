/**
 * Created by mox on 09/05/16.
 */
"use strict";


/** vars */
const assert = require('assert');
const http = require('http');
const express = require('express');
const digirest = require('../digirest');
const PROPERTIES_FOLDER = 'config/';
global.__base = __dirname + '/';

/*************************** TEST SECTION *************************************/
describe('Init',function(){
    "use strict";

    var app = express();
    var server = http.createServer(app);
    server.listen(4000);
    
    it('should init',function(done){
        digirest.init(app,express.Router(),server,PROPERTIES_FOLDER);
        setTimeout(done,9000);
    });
    
    it('should return the object factory',function() {
        assert(typeof digirest.getObjectFactory(),'Object','object factory must be defined');
    });

});



