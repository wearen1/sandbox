global.config = require("konfig")();
var pmx = require('pmx').init();

if (process.env.NODE_ENV == null) {
  process.env.NODE_ENV = 'production';
}

process.chdir(__dirname);

var express = require('express');
var http = require('http');
var app = express();

app.use(require('quick-login')(function(data, next) {
  var res;
  res = data.name === 'runexto' && data.pass === '1234';
  return next(null, res);
}));

//boot
require('./boot/index')(app);

// routing
require('./routes/index')(app);

app.use(pmx.expressErrorHandler());

http.createServer(app).listen(config.app.port, function () {
    console.log('Express server listening on port ' + config.app.port);
});
