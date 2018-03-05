"use strict";

module.exports = function (core)
 {
  core.pg.client = new core.pg.Client(core.configuration.postgres);
  return core.pg.client.connectAsync();

 };
