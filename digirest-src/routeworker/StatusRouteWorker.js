/**
 * simple status route worker
 * Author: Aureliano
 */

"use strict";
const AbstractRouteWorker = require('./AbstractRouteWorker');


class StatusRouteWorker extends AbstractRouteWorker {

  invoke(req, res) {
    var outMessage = '<html><body><h1>Digirest running!</h1><table>';

    if (process.env.UNITCODE) {
      outMessage += "Service wired on organization " + process.env.UNITCODE;
      console.log("UNIT CODE: " + process.env.UNITCODE);
    }

    var discoveryService = require('../objectFactory/ObjectFactory').discoveryService;
    var routes = discoveryService.printRoutes();
    for (var i = 0; i < routes.length; i++) {
      outMessage += '<tr><td>' + routes[i] + '</td></tr>';
    }
    outMessage += '</table></body></html>';

    res.send(outMessage);
    return;
  }
}
;

module.exports = StatusRouteWorker;

