digirest
=================

Digitalx REST API toolkit.
Build and deploy API on Azure, with Express and MongoDB.

WORK IN PROGRESS DOCUMENTATION - if you are in a hurry contact us at aureliano@digitalx.it / mobile@digitalx.it

Installation
=================
TODO

Basic Configuration
=================

    const digirest = require('digirest');
    const express = require('express');
    global.__base = __dirname + '/';
    var app = express();
    var server = http.createServer(app);
    server.listen(PORT);
    digirest.init(app,express.Router(),server,PROPERTIES_FOLDER);

Mongo Configuration
=================
Mongo configuration can be either in properties file:

    mongodb.protocol=mongodb
    mongodb.user=test
    mongodb.pwd=test
    mongodb.host=localhost
    mongodb.port=27017
    mongodb.database=Test

or in enviroment variables:

    MONGO_CONN = mongodb://test:test@plocalhost:27017/Test

