var busboy      = require('connect-busboy');
var fs          = require('fs-extra');  
var path 		= require('path');

function escapeHtml(text) {
  	var map = {
    	'&'	: '&amp;',
    	'<'	: '&lt;',
    	'>'	: '&gt;',
    	'"'	: '&quot;',
    	"'"	: '&#039;'
  	};

  	return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}
module.exports = function (app) {

	var MessageModel 		= require('../libs/mongoose').MessageModel; //импортим модель сообщений
	var ConversationModel 	= require('../libs/mongoose').ConversationModel;

    app.get('/dialog/api/messages/:convID/:offset', function(req, res) {//Get messages of conversation
    	//console.log(req.user);

    	if(req.user != undefined){//if smb trying to get here
    		var condition;
    		if(req.params.offset!= '0'){
    			condition = {conversation: req.params.convID, _id:{$gt: req.params.offset}};
    		} else {
    			condition = {conversation: req.params.convID};
    		}
	        MessageModel.find(condition, {'user.password': 0}, {sort:{date: 1}})
	        .populate('user').exec(function (err, messages) {

		        if (!err) {
		            return res.send(messages);
		        } else {// if error 
		            return res.send({ status: 'Error', message: 'D001' + res.statusCode + err.message });
		        }
		    });
    	} else {
    		res.redirect('/'); //if user not logged redir him to index.html
    	}
    });


    app.get('/dialog/api/attachments/:convID', function (req, res) {
    	MessageModel.find({conversation: req.params.convID, isAttach: true}, {'user.password': 0}, {sort:{date: 1}})
        .populate('user').exec(function (err, messages) {

	        if (!err) {
	            return res.send(messages);
	        } else {// if error 
	            return res.send({ status: 'Error', message: 'D001' + res.statusCode + err.message });
	        }
	    
	    });
    });


    app.post('/dialog/api/readMessage', function (req, res) {
    	MessageModel.update({_id: req.body.message}, {$set: {readed: true}, $currentDate: { last_date: true}},
    		function(err, aff){

    			ConversationModel.update({messages: req.body.message}, {$currentDate: { update: true}}, function (err, aff){console.log(err);} );

    			console.log('Readed: '+ req.body.message);
    			return res.send({status: 'OK'});
    		}
    	);// Обновляем статус сообщения


    });

    app.post('/dialog/api/sendfile', function (req, res) {
    	var conv;
        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('field', function(fieldname, val) {
		     //console.log(fieldname, val);
		    conv = val;
		});

        req.busboy.on('file', function (fieldname, file, filename) {
            //console.log("Uploading: " + filename);
            var type = filename.substring(filename.lastIndexOf('.'));
            //Path where image will be uploaded
            var spath = '/attachments/' + Date.now() + type;

            fstream = fs.createWriteStream(path.join(__dirname + "/..", 'public' + spath));
            file.pipe(fstream);
            fstream.on('close', function () {
                
            	var message = new MessageModel({
			        user: 			req.user._id ,
			        conversation: 	conv,
			        text: 			'',
			        isAttach: 		true,
			        attachment:     {
				            name:       filename,
				            kind:       type.substring(1),
				            url:        spath
				    }
			    });


			    message.save(function(err, msg) {
			        if (!err) {
			            //console.log("article created");
			            ConversationModel.update({_id: conv}, {$push: {messages: msg._id}, $currentDate: { update: true} },

			            	function (err, nums){
			            		console.log(err+"||"+nums);
			            	}
			            );

			            return res.send({ status: 'OK', msgID: message._id});
			        } else {
			            console.log(err);
			            if(err.name == 'ValidationError') {
			                res.send({ status: 'Error', message: 'D002' });
			            } else {
			                res.send({ status: 'Error', message: 'D003' });
			            }
			            //End blocks of errors
			        }
			    });//Saving message
                           //where to go next
            });
        });
        //О боже наконец то работает
    });

    app.post('/dialog/api/sendmsg', function (req, res) {//Save message to conversation
    	if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});//if smb trying to get here
    		//console.log(req);


    	var msg_text = escapeHtml(req.body.text);

		var message = new MessageModel({
	        user: 			req.user._id ,
	        conversation: 	req.body.conv,
	        text: 			msg_text
	    });


	    message.save(function (err, msg) {
	        if (!err) {
	            //console.log("article created");
	            ConversationModel.update({_id: req.body.conv}, {$push: {messages: msg._id}, $currentDate: { update: true} },

	            	function(err, nums){
	            		return res.send({ status: 'OK'});
	            	}
	            );

	        } else {
	            console.log(err);
	            if(err.name == 'ValidationError') {
	                res.send({ status: 'Error', message: 'D002' });
	            } else {
	                res.send({ status: 'Error', message: 'D003' });
	            }
	            //End blocks of errors
	        }
	    });//Saving message
    });


	app.post('/dialog/api/forward', function (req, res) {//Save message to conversation
    	if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});//if smb trying to get here
    		//console.log(req);
    	
		var message = new MessageModel({
	        user: 			req.user._id ,
	        conversation: 	req.body.to,
	        isForward: 		true,
	        forward: 		req.body.messages,
	        isChange: 		true,
	        change: 		{
	        	kind: 			"fw"
	        }
	    });


	    message.save(function (err, msg) {
	        if (!err) {
	            //console.log("article created");
	            ConversationModel.update({_id: req.body.to}, {$push: {messages: msg._id}, $currentDate: { update: true} },

	            	function(err, nums){
	            		return res.send({ status: 'OK'});
	            	}
	            );

	        } else {
	            if(err.name == 'ValidationError') {
	                res.send({ status: 'Error', message: 'Dx002' });
	            } else {
	                res.send({ status: 'Error', message: 'Dx003' });
	            }
	            //End blocks of errors
	        }
	    });//Saving message
    });


	app.post('/dialog/api/delete', function (req, res) {
		if(req.user == undefined) 
			return res.send({status: 'Error', message: 'Unathorized'});

    	MessageModel.update({_id: {$in: req.body.messages} }, {$set: {visible: false}, $currentDate: { last_date: true}}, {multi: true},
    		function(err, aff){
    			ConversationModel.update({_id: req.body.conv}, {$currentDate: { update: true} },
		        	function (err, nums){
		        		return res.send({status: 'OK'});
		        	}
		        );
    		}
    	);// Обновляем статус сообщения
    });
	
};