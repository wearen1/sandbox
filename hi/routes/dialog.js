module.exports = function (app) {
    app.get('/dialog', function (req, res) {
    	if(req.user != undefined){
	        res.render('dialog', {
	            user: req.user
	        });
    	}else{
    		res.redirect('/');
    	}
    });
};