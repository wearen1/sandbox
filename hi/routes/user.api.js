var md5         = require('MD5');
var busboy      = require('connect-busboy');
var fs          = require('fs-extra');  
var path        = require('path');

module.exports = function (app) {

	var UserModel 			= require('../libs/mongoose').UserModel;
	var ConversationModel 	= require('../libs/mongoose').ConversationModel;
	var Base64 				= require('../libs/base64').Base64;

	var CurUserFields = {'firstname': 1, 'lastname': 1, 'image': 1, 'preferences': 1, 'contacts': 1, 'status': 1, 'chat_background': 1};//Чтобы не посылать лишнюю инфу

	app.post('/user/api/get', function (req, res) {//searching users
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});
		//console.log(req.query.data);

		var re_f = new RegExp(req.query.data.split(' ')[0], 'i');
		var re_l = new RegExp(req.query.data.split(' ')[1], 'i');
		UserModel.find({'preferences.global': true, 'firstname': { $regex: re_f }, 'lastname': { $regex: re_l }}).exec(

			function (err, users) {
				//console.log(users);
		        if (!err) {
		            return res.send({status: 'OK', data: users});
		        } else {
		            res.statusCode = 500;
		            console.error('Internal error(%d): %s' + res.statusCode + err.message);
		            return res.send({ error: 'Server error' });
		        }
		    }

		);
	});

	app.get('/user/api/get/:uid', function (req, res) {//getting user
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		if(req.params.uid == 0) req.params.uid = req.user._id;

		UserModel.findOne({_id: req.params.uid}, {}).populate('contacts.user').select(CurUserFields).exec(

			function (err, users) {
		        if (!err) {
		            return res.send({data: users, server_time: Date.now()});
		        } else {
		            res.statusCode = 500;
		            console.error('Internal error(%d): %s' + res.statusCode + err.message);
		            return res.send({ error: 'Server error' });
		        }
		    }

		);
	});

	app.post('/user/api/setcontact/', function (req, res) {
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		if(req.body.isAccept){
			UserModel.update({_id: req.user._id, 'contacts.user': req.body.contact}, {
				$set: {
					'contacts.$.state': 2
				},
				$currentDate: {
					'contacts.$.last_change': true
				} 
			}).exec()
			.then(function(data){
				UserModel.update({_id: req.body.contact}, {
					$addToSet: {
						'contacts': {
							user: req.user._id,
							state: 2
						} 
					}
				}).exec()
				.then(function(data){
					return res.send({status: 'OK'});
				});
			});
		}else{
			UserModel.update({_id: req.user._id}, {
				$pull: {
					'contacts': {
						user: req.body.contact
					} 
				}
			},
				function (err, affected){
					return res.send({status: 'OK'});
				}
			);
		}
	});

	app.post('/user/api/addcontact/', function (req, res) {
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});
		//console.log( req.body.contact);

		if(req.body.isPrivate){//Если пользователь приватный то отправляем ему запрос на добавление

			
			UserModel.update({
				'_id'				: req.body.contact
			}, {
				$addToSet: {
					'contacts': {
						user: req.user._id, 
						state: 1
					} 
				}
			}, 
				function (err, affected){
					console.log('/user/api/addcontact/' + " | " + err + " | " + affected);
					if(affected>0){
						return res.send({status: 'OK'});
					}else{
						return res.send({ status: 'Error', error: 'NCxU001' });
					}
					return res.send({ status: 'Error', error: 'U-001'+err.message });
				}
			);

			
		}else{
			UserModel.update({
				'_id'				: req.user._id
			}, {
				$addToSet: {
					'contacts': {
						user: req.body.contact, 
						state: 2
					}
				} 
			}, 
				function (err, affected){
					if(affected>0){
						return res.send({status: 'OK'});
					}else{
						return res.send({ status: 'Error', error: 'NCxU002' });
					}
					return res.send({ status: 'Error', error: 'U-001'+err.message });
				}
			);
		}

	});

	app.post('/user/api/deletecontact/', function (req, res) {
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});
		//console.log( req.body.contact);

		UserModel.update({_id: req.user._id}, {
			$pull: {
				'contacts': {
					_id: req.body.contact
				}
			}
		},
			function (err, affected){
				console.log(err);
				console.log(affected);
				return res.send({status: 'OK'});
			}
		);
			//return res.send({status: 'OK'});

	});

	app.post('/user/api/setTheme/', function (req, res) {
		//console.log( req.body.contact);
		UserModel.update({_id: req.user._id}, {$set: {'preferences.theme': req.body.theme} , $currentDate: { last_date: true} }, 
			function (err, affected){
				if(affected>0)return res.send({status: 'OK'});
				return res.send({ status: 'Error', error: 'U-002'+err.message });
			}
		);

	});

	app.post('/user/api/preferences/', function (req, res) {
		//console.log( req.body.contact);
		if(req.body.preferences==null)return res.send({ status: 'Error', error: 'U-006' });

		UserModel.update({_id: req.user._id}, {$set: {'preferences': req.body.preferences} , $currentDate: { last_date: true} }, 
			function (err, affected){
				if(affected>0)return res.send({status: 'OK'});
				return res.send({ status: 'Error', error: 'U-002'+err.message });
			}
		);

	});

	app.post('/user/api/update/:status', function (req, res) {//Updating status

		//if(req.params.status == 0)return res.send(req.user.user);

		UserModel.update({_id: req.user._id}, {$set: {status: req.params.status}, $currentDate: { last_date: true} },

			function (err, user){
		        //console.log('Affected: '+user);
		        if (!err) {

		        	ConversationModel.update({members: req.user._id}, { $currentDate: { update: true} }, {multi: true},
			        	function(err, nums){
			        		console.log(err+"|"+nums);
			        	}
			        );

		        	return res.send({status: 'OK'});
		        } else {
		            res.statusCode = 500;
		            console.error(res.statusCode + err.message);
		            return res.send({ status: 'Error', error: 'Server error' });
		        }
		    }  

		);
	});

	app.post('/user/api/changeProfilePassword/', function (req, res) {

		//console.log( req.body.contact);
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		UserModel.update({_id: req.user._id, password: md5(Base64.decode(req.body.old))}, {$set: {'password': md5(Base64.decode(req.body.new))} , $currentDate: { last_date: true} }, 
			function (err, affected){
				if(affected>0)return res.send({status: 'OK'});
				return res.send({ status: 'Error', error: 'Ux023'});
			}
		);

	});

	app.post('/user/api/changeProfileData/', function (req, res) {
		//console.log( req.body.contact);
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		UserModel.update({_id: req.user._id}, {$set: {'firstname': req.body.firstname, 'lastname': req.body.lastname} , $currentDate: { last_date: true} }, 
			function (err, affected){
				if(affected>0)return res.send({status: 'OK'});
				return res.send({ status: 'Error', error: 'Ux024'});
			}
		);

	});
	
	app.post('/user/api/changeProfileImage', function (req, res) {
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

        var fstream;
        req.pipe(req.busboy);


        req.busboy.on('file', function (fieldname, file, filename) {

            var type = filename.substring(filename.lastIndexOf('.'));
            if(type!= '.png' && type!='.jpg' && type!='.jpeg')return res.redirect('/'); //Проверка, чтобы не лили всякую хрень

            var spath = '/profileImages/' + md5(Date.now() + req.user.email) + type;

            fstream = fs.createWriteStream(path.join(__dirname + "/..", 'public' + spath));
            file.pipe(fstream);
            fstream.on('close', function () {

            	UserModel.findOne({_id: req.user._id},{}).select({'image': 1}).exec(
					function (err, users) {
				        if (!err) {
				            fs.unlink(path.join(__dirname + "/..", 'public' + users.image));//Delete previous image

			                UserModel.update({_id: req.user._id}, {$set: {image: spath}, $currentDate: { last_date: true} },
								function (err, user){
							        if (!err) {
							        	return res.send({status: 'OK', image: spath});
							        } else {
							            return res.send({ status: 'Error', error: 'Ux025' });
							        }
							    }  

							);

				        } else {
				            return res.send({ status: 'Error', error: 'Ux0251' });
				        }
				    }
				);
				
            });//Uploading

        }); // Busboy
    });

	
	app.post('/user/api/change/chat_background/preset', function (req, res) {
		//console.log( req.body.contact);
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		if(req.body.backID < 1 || req.body.backID > 4){
			return res.send({status: 'Error', message: 'Ux00PP'});
		}

		UserModel.update({_id: req.user._id}, {$set: {'chat_background': '/dialogBacks/preset/' + req.body.backID + '.jpg'} , $currentDate: { last_date: true} }, 
			function (err, affected){
				if(affected>0){
					return res.send({status: 'OK'});
				}else{
					return res.send({ status: 'Error', error: 'Ux01PP'});
				}
			}
		);

	});

	app.post('/user/api/change/chat_background', function(req, res) {//Изменям беседу
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

        var fstream;
        req.pipe(req.busboy);

        req.busboy.on('file', function (fieldname, file, filename) {
            //console.log("Uploading: " + filename);
            var type = filename.substring(filename.lastIndexOf('.'));

            if(type!= '.png' && type!='.jpg' && type!='.jpeg')return res.redirect('/'); //Проверка, чтобы не лили всякую хрень
            //Path where image will be uploaded
            var timestamp = '?' + Date.now();
            var spath = '/dialogBacks/' + md5(req.user._id) + type;

            fstream = fs.createWriteStream(path.join(__dirname + "/..", 'public' + spath));
            file.pipe(fstream);
            fstream.on('close', function () {

			    UserModel.update({_id: req.user._id}, {$set: {'chat_background': spath + timestamp} , $currentDate: { last_date: true} }, 
					function (err, affected){
						if(affected>0){
							return res.send({status: 'OK', image: spath + timestamp});
						}else{
							return res.send({ status: 'Error', error: 'Ux01PP'});
						}
					}
				);
                
            });
        });
	});

};