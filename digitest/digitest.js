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

    it('should init',function(done){
        var app = express();
        var server = http.createServer(app);
        server.listen(4000);
        digirest.init(app,express.router,server,PROPERTIES_FOLDER);

        setTimeout(done,5000);

    });

});



