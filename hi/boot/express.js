var express     = require('express');
var passport    = require('passport');
var path        = require('path');
var flash       = require('connect-flash');
var busboy      = require('connect-busboy');
var fs          = require('fs-extra');  

module.exports = function (app) {

    app.set('port', config.app.port || 3000);
    app.set('views', path.join(__dirname + "/..", 'views'));
    app.set('view engine', 'jade');

    var sessionOptions = {
        "secret": config.app.cookie_secret,
        "key": "sid",
        "cookie": {
            "path": "/",
            "httpOnly": true,
            "maxAge": null
        }
    };

    // if ('production' == app.get('env')) {
    //     var MemcachedStore = require('connect-memcached')(express);
    //     sessionOptions.store = new MemcachedStore(config.get("memcached"));
    // }

    //if behind a reverse proxy such as Varnish or Nginx
    //app.enable('trust proxy');
    app.use(busboy());
    //app.use(express.logger('dev'));
    app.use(express.static(path.join(__dirname + "/..", 'public')));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session(sessionOptions));
    app.use(flash());

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(app.router);

    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }

};
