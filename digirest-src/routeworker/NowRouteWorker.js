/**
 * Created by Aureliano on 11/02/2016.
 * simple now route worker
 * Author: Aureliano
 */
"use strict";
const AbstractRouteWorker = require('./AbstractRouteWorker');


class NowRouteWorker extends AbstractRouteWorker {

  invoke(req, res) {
    res.send(new Date());
  }

}
;

module.exports = NowRouteWorker;