var lib = require('../lib');

var mongoose = require('mongoose'),
	deferred = require('deferred'),
	findOrCreate = require('mongoose-findorcreate'),
	MongoClient = require('mongodb').MongoClient;

Promise = lib.get('bluebird');
Promise.promisifyAll(mongoose);

var cacheOpts = {
    max:1000,
    maxAge: 1000 * 60 * 5
};

require('mongoose-cache').install(mongoose, cacheOpts);

var node_db_connection = mongoose.createConnection('mongodb://localhost/runexto_node_' + process.env.NODE_ENV),
	rails_db_connection = mongoose.createConnection('mongodb://localhost/runexto_rails_' + process.env.NODE_ENV);

var db_wait_until = function(){
	var d = deferred();
	arguments[0].once(arguments[1], function(err){
		if (!err)
			d.resolve(true);
		else {
			d.reject(false);
		}
	});
	return d.promise;
};



var it = {
	mongoose: mongoose,
	node: node_db_connection,
	rails: rails_db_connection,
	mc: null,
	on: function(ev){
		return db_wait_until(node_db_connection, ev)
		.then(function(){
			console.log('node connection initialized');
			return db_wait_until(rails_db_connection, ev)
			.then(function(){
				console.log('rails connection initialized');

				var d = deferred();

				MongoClient.connect('mongodb://localhost:27017/runexto_node_' + process.env.NODE_ENV, function(err, mc){
					if (!err) {
						it.mc = mc;
						d.resolve(mc);
					}
					else
						d.reject(err);
				});
				return d.promise;
			});
		});
	},
	close: function(){
		node_db_connection.close();
		rails_db_connection.close();
	}
};

exports.connections = it;

exports.plugins = {
	findOrCreate: findOrCreate
};
