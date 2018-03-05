module.exports = function (app) {

	var ConversationModel 	= require('../libs/mongoose').ConversationModel;
	var MessageModel 		= require('../libs/mongoose').MessageModel;
	var UserModel 			= require('../libs/mongoose').UserModel;
	var log 				= require('../libs/log').getLogger();

	app.post('/notification/api/messages/', function (req, res) {//Last notifications
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});
		var time = req.body.time;
		
		UserModel.update({_id: req.user._id}, { $currentDate: { last_date: true} },
        	function(err, nums){
        		//Nothing
        	}
        );

		ConversationModel.find({members: req.user._id, update: {'$gt': new Date(time)} }, {}, {sort:{magID: 1}})
		.populate(
			[{
				match: {
					last_date: {
						'$gte': new Date(time)
					}
				},
				path: 'messages'
			},

			"members", "typing.user"]
		).exec(
			function (err, convs){
				//console.log(convs);
				if (!err) {
					MessageModel.populate(convs, [{
						path: 'messages.user',
		        		model: UserModel
					},{
		        		path: 'messages.forward',
		        		model: MessageModel
		        	}], function (err, convers){


		        		MessageModel.populate(convers, {
							path: 'messages.forward.user',
			        		model: UserModel
						}, function (err, converss){
			        		
			        		//9 кругов populate


			            	return res.send({data: converss, server_time: new Date()});
			        	});

		            	//return res.send({data: convers, server_time: new Date()});
		        	});

		        } else {// if error 
		            return res.send({ status: 'Error', message: 'N001' + res.statusCode + err.message });
		        }
			}
		);
	});


	app.post('/notification/api/contacts/', function (req, res) {//Contacts online
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});
		
		var time = req.body.time;
		//var num  = req.body.num;
		UserModel.findOne({_id: req.user._id}, {}, {}).select('contacts')
		.populate(
			{
				path: "contacts.user"
			}
		).exec(
			function (err, user){
				if (!err) {
	            	return res.send({'contacts': user.contacts, 'server_time': Date.now(), 'status': 'OK'});
		        } else {// if error 
		            return res.send({ status: 'Error', message: 'N002 ' + res.statusCode + err.message });
		        }
			}
		);
	});
}