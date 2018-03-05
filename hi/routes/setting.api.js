module.exports = function (app) {

	var UserModel = require('../libs/mongoose').UserModel;

	app.post('/setting/api/change', function (req, res) {//Save message to conversation
    	if(req.user != undefined){//if smb trying to get here
    		var user = new UserModel({
    			email:  	req.body.data[2],
    			firstname: 	req.body.data[0],
    			lastname:  	req.body.data[1],
    			image:  	req.body.data[3]
    		});

    		var upsertData = user.toObject();
    		delete upsertData._id;

    		UserModel.update({_id: req.user._id}, upsertData, {multi: false}, function(err) {
			  	
    			if(!err){
    				return res.send({"status": "OK"})
    			}else{
    				return res.send({"status": "Error", "message": "S001"})
    			}
			});
    	}
    });
}