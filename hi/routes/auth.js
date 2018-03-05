var passport    = require('passport');
var md5         = require('MD5');
var busboy      = require('connect-busboy');
var fs          = require('fs-extra');  
var path        = require('path');
var UserModel   = require('../libs/mongoose').UserModel;

module.exports = function (app) {

    app.post('/register', function(req, res){
        if (req.isAuthenticated()) {
            res.redirect('/');
            return;
        }

        var fstream;
        var data = new Array(5);
        req.pipe(req.busboy);


        req.busboy.on('field', function(fieldname, val) {//Input values
            switch(fieldname){
                case 'firstname':
                    data[0] = val;
                break;

                case 'lastname':
                    data[1] = val;
                break;

                case 'login':
                    data[2] = val;
                break;

                case 'email':
                    data[3] = val;
                break;

                case 'pass':
                    data[4] = val;
                break;
            }
        });


        req.busboy.on('file', function (fieldname, file, filename) {

            UserModel.find({$or: [{email: data[3]}, {login: data[2]}]}, function (err, user) {
                if(user.length != 0){
                    console.log('Errrrrr');
                    return res.redirect('/'); //Такой пользователь уже есть
                }else{
                    var type = filename.substring(filename.lastIndexOf('.'));
                    if(type!= '.png' && type!='.jpg' && type!='.jpeg')return res.redirect('/'); //Проверка, чтобы не лили всякую хрень

                    var spath = '/profileImages/' + md5(Date.now() + data[3]) + type;

                    fstream = fs.createWriteStream(path.join(__dirname + "/..", 'public' + spath));
                    file.pipe(fstream);
                    fstream.on('close', function () {
                        
                        var userDB = new UserModel({
                            login:      data[2],
                            email:      data[3],
                            password:   md5(data[4]),
                            firstname:  data[0],
                            lastname:   data[1],
                            image:      spath
                        });
                        userDB.save(function(err, user) {
                            if(err){
                                return res.redirect('/'); // В любой непонятной ситуации, ну вы поняли
                            }else{
                                req.login(user, function(err) {
                                    return res.redirect('/'); // В любой понятной ситуации тоже
                                });
                            }
                        });//Saving
                    });//Uploading
                }
            });//Findig similar
        }); // Busboy
    });

    app.get('/auth', function (req, res) {

        if (req.isAuthenticated()) {
            res.redirect('/');
            return;
        }

        res.render('auth', {
            // error: req.flash('error')
            error: 'error'
        });
    });

    app.get('/sign-out', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/auth', passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/',
        failureFlash: true })
    );

    app.get('/auth/fb',
        passport.authenticate('facebook', {
            scope: 'read_stream'
        })
    );

    app.get('/auth/fb/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/auth' })
    );

    app.get('/auth/vk',
        passport.authenticate('vk', {
            scope: ['friends']
        }),
        function (req, res) {
            // The request will be redirected to vk.com for authentication, so
            // this function will not be called.
        });

    app.get('/auth/vk/callback',
        passport.authenticate('vk', {
            failureRedirect: '/auth'
        }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });
};
