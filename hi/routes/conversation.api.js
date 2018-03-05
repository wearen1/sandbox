var md5         = require('MD5');
var busboy      = require('connect-busboy');
var fs          = require('fs-extra');  
var path        = require('path');
var mongoose 	= require('mongoose');

module.exports = function (app) {
	var MSG_ON_PAGE = 16;

	var ConversationModel 	= require('../libs/mongoose').ConversationModel;
	var UserModel 			= require('../libs/mongoose').UserModel;
	var MessageModel 		= require('../libs/mongoose').MessageModel;

	app.get('/conversation/api/get/:offset', function (req, res) {
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});


		var uid = req.user._id;

		var condition;//Условия
		if(req.params.offset!= '0'){
			condition = {'members': uid, _id:{$gt: req.params.offset}};
		}else{
			condition = {'members': uid};
		}

		ConversationModel.find(condition, {messages: { $slice: [ -MSG_ON_PAGE, MSG_ON_PAGE ] } }, {sort:{update: 1}})
		.populate({
			path: 'messages', 
			select: { 'password': 0 },
			match: { visible: true}  
		})
		.populate([
			'members', 'typing.user'
		]).exec( 
			function (err, convs) {
		        if (!err) {
					MessageModel.populate(convs, [{
						path: 'messages.user',
						select: { 'password': 0 },
		        		model: UserModel
					},{
		        		path: 'messages.forward',
		        		model: MessageModel
		        	}], function (err, convers){


		        		MessageModel.populate(convers, {
							path: 'messages.forward.user',
							select: { 'password': 0 },
			        		model: UserModel
						}, function (err, converss){
			        		
			        		//9 кругов populate


			            	return res.send(converss);
			        	});

		            	//return res.send({data: convers, server_time: new Date()});
		        	});

		        } else {// if error 
		            return res.send({ status: 'Error', message: 'Cx001' + res.statusCode + err.message });
		        }
		    }
		);
	});

	// app.post('/conversation/api/')

	app.post('/conversation/api/create', function(req, res) {
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		var members = req.body.members;
		members.push(req.user._id);//Add current user to conv
	
		if(members.length<2){
			return res.send({status: 'Error', message: 'C001'});
		}//If conversation with 1 or 0 persons


		if(!req.body.isConv){//Если не конфа
			ConversationModel.findOne({
				'members': {
					'$size': members.length,
					'$all': members
				},
				isConv: req.body.isConv
			}).populate('members').exec(
				function (err, conv) {
			        if (!err) {
			        	if(conv == null){//Если такой конфы нет, то создаем ее

			        		var c_name = ' '; //Name of conversation
							var isConv = false;//Is conversation
							
									
							if(members.length > 2){
								c_name = members[0].firstname + ', ' + members[1].firstname + '...';//Name of conversation
								isConv = true;
							}

					    	var conversation = new ConversationModel({
					    		name: 		c_name,
					    		image: 		'',
						        members: 	members,
						        isConv:  	isConv
						    });


					    	conversation.save(function (err, conver) {
						        if (!err) {
						            console.log("conversation created");

						            ConversationModel.findOne(conver).populate('members').exec(function (err, conv){
						            	console.log(conv);
						            	if(conv!=null){
						            		return res.send({ status: 'OK', conv: conv });	
						            	}
						            	return res.send({ status: 'OK', conv: conver });	
						            });//Пытаемся получить пользователей

						        } else {
						            console.log(err);
						            if(err.name == 'ValidationError') {
						                res.send({ status: 'Error', message: 'C002' });
						            } else {
						                res.send({ status: 'Error', message: 'C003' });
						            }
						            //End blocks of errors
						        }
						    });

			        	}else{
			        		return res.send({status: 'OK', conv: conv});
			        	}
			        } else {
			            res.statusCode = 500;
			            console.error('Internal error(%d): %s' + res.statusCode + err.message);
			            return res.send({ status: 'Error', message: 'C005' });
			        }
			    }
			);
		} else {

			var c_name = members[0].firstname + ', ' + members[1].firstname + '...';//Name of conversation
			var isConv = true;

			var conversation = new ConversationModel({
	    		name: 		c_name,
	    		image: 		'',
		        members: 	members,
		        isConv:  	isConv
		    });

			conversation.save(function (err, conver) {
		        if (!err) {
		            console.log("conversation created");

		            ConversationModel.findOne(conver).populate('members').exec(function (err, conv){
		            	console.log(conv);
		            	if(conv!=null){
		            		return res.send({ status: 'OK', conv: conv });	
		            	}
		            	return res.send({ status: 'OK', conv: conver });	
		            });//Пытаемся получить пользователей

		        } else {
		            console.log(err);
		            if(err.name == 'ValidationError') {
		                res.send({ status: 'Error', message: 'C002' });
		            } else {
		                res.send({ status: 'Error', message: 'C003' });
		            }
		            //End blocks of errors
		        }
		    });
		}
		//Conversation created
    });

	
	app.post('/conversations/api/typing', function(req, res) {//Записываем тех кто пишет
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		ConversationModel.update({_id: req.body.conv}, {$pull: {typing: {user: req.body.user}} },
        	function (err, nums){
        		ConversationModel.update({_id: req.body.conv}, {$push: {typing: {user: req.body.user}}, $currentDate: { update: true} },
		        	function (err, nums){
		        		return res.send({status: 'OK'});
		        	}
		        );
        	}
        );
	});

	app.post('/conversations/api/change', function(req, res) {//Изменям беседу
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});



		var message = new MessageModel({
	        user: 			req.user._id ,
	        conversation: 	req.body.conv,
	        isChange: 		true,
	        change: 		{
	        		kind: 		'name'
	        }

	    });
	    message.save(function(err, message){
	    	ConversationModel.update({_id: req.body.conv, name: {$ne: req.body.name}}, {$set: {name: req.body.name}, $push: {messages: message._id}, $currentDate: { update: true} },
            	function(err, nums){
            		if(nums.length > 0){
						return res.send({status: 'OK'});
            		}else{
						return res.send({status: 'Error', message: 'Cx022'});
            		}
            	}
            );
	    });
			    
	});

	app.post('/conversations/api/change/image', function(req, res) {//Изменям беседу
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		var conv;
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('field', function(fieldname, val) {
		     //console.log(fieldname, val);
		    switch(fieldname){
		    	case 'conv':
		    		conv = val;
		    	break;
		    }
		});

        req.busboy.on('file', function (fieldname, file, filename) {
            //console.log("Uploading: " + filename);
            var type = filename.substring(filename.lastIndexOf('.'));

            if(type!= '.png' && type!='.jpg' && type!='.jpeg')return res.redirect('/'); //Проверка, чтобы не лили всякую хрень
            //Path where image will be uploaded
            var timestamp = '?' + Date.now();
            var spath = '/dialogImages/' + md5(conv) + '.jpg';

            fstream = fs.createWriteStream(path.join(__dirname + "/..", 'public' + spath));
            file.pipe(fstream);
            fstream.on('close', function () {
                
        		var message = new MessageModel({
			        user: 			req.user._id ,
			        conversation: 	conv,
			        isChange: 		true,
			        change: 		{
			        		kind: 		'image'
			        }
			    });

			    message.save(function(err, message){
			    	ConversationModel.update({_id: conv}, {$set: {'image': spath + timestamp }, $push: {messages: message._id}, $currentDate: { update: true} },
		            	function(err, nums){
        					return res.send({status: 'OK', pic: spath + timestamp});
		            	}
		            );
			    });
                
            });
        });
	});

	app.post('/conversations/api/addmember', function(req, res) {//Изменям беседу
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		var message = new MessageModel({
	        user: 			req.user._id ,
	        conversation: 	req.body.conv,
	        isChange: 		true,
	        change: 		{
	        		kind: 		'invite',
	        		subject: 	req.body.username
	        }
	    });
	    message.save(function(err, message){
	    	ConversationModel.update({_id: req.body.conv}, {$addToSet: {members: req.body.userID}, $push: {messages: message._id}, $currentDate: { update: true} },
            	function(err, nums){
					return res.send({status: 'OK'});
            	}
            );
	    });

	});

	app.post('/conversations/api/delete', function(req, res) {//Изменям беседу
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		var message = new MessageModel({
	        user: 			req.user._id ,
	        conversation: 	req.body.conv,
	        isChange: 		true,
	        change: 		{
	        		kind: 		'left'
	        }
	    });
	    message.save(function(err, message){

	    	var update;

			if(req.body.isConv){
				update = {
							$pull: {members: req.user._id}, 
							$currentDate: { update: true},
							$push: 			{messages: message._id} 
				};
			}else{
				update = {
							$pull: 			{members: req.user._id},
							$set: 			{name: (req.user.firstname + " " + req.user.lastname + " (archieve)"),
											image: req.user.image},
							$currentDate: 	{update: true},
							$push: 			{messages: message._id}
				};
			}

	    	ConversationModel.update({_id: req.body.conv}, update,
            	function(err, nums){
            		if(err){
						return res.send({status: 'Error', message: 'Cx002'});
            		}else{
						return res.send({status: 'OK'});
            		}
            	}
            );
	    });
	});

	app.post('/conversations/api/loadMessages/', function(req, res) {//Изменям беседу
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

		var lastID 	= req.body.lastID;
		var convID 	= req.body.convID;

		ConversationModel.findOne({_id: convID}, {messages: { $slice: MSG_ON_PAGE + 1 } }, {})
		.populate({
			path: 'messages', 
			select: { 'password': 0 },
			match: {
				visible: true,
				_id: {
					'$lt': mongoose.Types.ObjectId(lastID)
				}
			}
		}).exec(
			function(err, data){
				//console.log(data.messages.length + " || " + num);
				var isComplete = (data.messages.length != (MSG_ON_PAGE + 1)) || data.messages.length == 0;
				if(!isComplete){
					data.messages.shift();
				}

				if (!err) {
					MessageModel.populate(data, [{
						path: 'messages.user',
						select: { 'password': 0 },
		        		model: UserModel
					},{
		        		path: 'messages.forward',
		        		model: MessageModel
		        	}], function (err, data_){


		        		MessageModel.populate(data_, {
							path: 'messages.forward.user',
							select: { 'password': 0 },
			        		model: UserModel
						}, function (err, data__){
			        		
			        		//9 кругов populate

							return res.send({status: 'OK', 'isComplete': isComplete, 'msg': data__.messages});
			        	});

		            	//return res.send({data: convers, server_time: new Date()});
		        	});

		        } else {// if error 
		            return res.send({ status: 'Error', message: 'Cx221' + res.statusCode + err.message });
		        }
			}
		);
			    
	});

};