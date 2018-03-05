var passport = require('passport');
var AuthLocalStrategy = require('passport-local').Strategy;
var AuthFacebookStrategy = require('passport-facebook').Strategy;
var AuthVKStrategy = require('passport-vkontakte').Strategy;
var md5 = require('MD5');

//db
var UserModel = require('../libs/mongoose').UserModel;

passport.use('local', new AuthLocalStrategy(
    function (usern, pass, done) {

        UserModel.find({$or: [{email: usern}, {login: usern}]}, function (err, user) {

            if (user.length>0) {
                if(user[0].password == md5(pass)){
                    return done(null, user[0]);
                }else{
                    return done(null, false, {
                        message: "Ошибка"
                    });
                }
                
            } else {

                return done(null, false, {
                    message: "Неверный email"
                });
            }
        });
    }
));

passport.use('facebook', new AuthFacebookStrategy({
        clientID: config.app.auth.fb.app_id,
        clientSecret: config.app.auth.fb.secret,
        callbackURL: config.app.url + "/auth/fb/callback",
        profileFields: [
            'id',
            'displayName',
            'profileUrl',
            "username",
            "link",
            "gender",
            "photos"
        ]
    },
    function (accessToken, refreshToken, profile, done) {

        //console.log("facebook auth: ", profile);

        return done(null, {
            username: profile.displayName,
            photoUrl: profile.photos[0].value,
            profileUrl: profile.profileUrl
        });
    }
));

passport.use('vk', new AuthVKStrategy({
        clientID: config.app.auth.vk.app_id,
        clientSecret: config.app.auth.vk.secret,
        callbackURL: config.app.url + "/auth/vk/callback"
    },
    function (accessToken, refreshToken, profile, done) {

        //console.log("facebook auth: ", profile);

        return done(null, {
            username: profile.displayName,
            photoUrl: profile.photos[0].value,
            profileUrl: profile.profileUrl
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, JSON.stringify(user));
});


passport.deserializeUser(function (data, done) {
    try {
        done(null, JSON.parse(data));
    } catch (e) {
        done(err)
    }
});

module.exports = function (app) {
};