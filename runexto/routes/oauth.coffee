api = require appRoot + '/api'
lib = require '../lib'
db = require '../db'

_ = lib.get '_'
log = lib.log()
crypto = lib.get 'crypto'

passport = lib.get 'passport'
FacebookStrategy = (lib.get 'passportFacebook').Strategy
TwitterStrategy = (lib.get 'passportTwitter').Strategy
VkontakteStrategy = (lib.get 'passportVkontakte').Strategy
LocalStrategy = (lib.get 'passportLocal').Strategy

validate = lib.get 'validate'
Promise = lib.get 'bluebird'

express = lib.get 'express'
oauth = express.Router()

passport.serializeUser (user, done)->
  done null, user

passport.deserializeUser (id, done)->
  done null, id

passport.use new TwitterStrategy
  consumerKey: 'wNGG0uPLsEvAMtPoRt2lIKogc'
  consumerSecret: 'n2u0aNF6I1mG6GdTKGmFW3ZFZUPKAUBUH0ViIMSaRLAR7Uty4Z'
  callbackURL: '/oauth/twitter/callback'
  passReqToCallback: true
, (req, token, tokenSecret, profile, done)->
  session = req.session
  session.oauth = session.oauth || {}
  session.oauth.tw = session.oauth.tw || {}

  session.oauth.tw =
    id: profile.id
    profile: profile
    token: token
    token_secret: tokenSecret

  userQuery = if session.user?._id? then {_id: session.user._id}  else {'socials.tw.id': profile.id}

  db.models.User.findOneAsync userQuery
  .then (user)->
    unless user
      session.save ->
        done null, profile
    else
      user.socials = user.socials || {}
      user.socials.tw = session.oauth.tw
      user.saveAsync()
      .then ->
        session.oauth = user.socials
        session.settings = user.settings
        session.user = user

        session.save ->
          done null, profile
  .catch (err)->
    log.error err
    done err

passport.use new VkontakteStrategy
  clientID: '3740177'
  clientSecret: 'khrTr5HtqRy9nUbPLcVg'
  callbackURL: '/oauth/vkontakte/callback'
  passReqToCallback: true
, (req, access_token, token_secret, profile, done)->
  session = req.session
  session.oauth = session.oauth || {}
  session.oauth.vk = session.oauth.vk || {}

  session.oauth.vk =
    id: profile.id
    profile: profile
    access_token: access_token

  userQuery = if session.user?._id? then {_id: session.user._id}  else {'socials.vk.id': profile.id}

  db.models.User.findOneAsync userQuery
  .then (user)->
    unless user
      session.save ->
        done null, profile
    else
      user.socials = user.socials || {}
      user.socials.vk = session.oauth.vk

      user.saveAsync()
      .then ->
        session.oauth = user.socials
        session.settings = user.settings
        session.user = user

        session.save ->
          done null, profile
  .catch (err)->
    log.error err
    done err

passport.use new FacebookStrategy
  clientID: '234726023403239'
  clientSecret: 'f6b028451349c779f99cf3cb9e4e3b3e'
  callbackURL: "/oauth/facebook/callback"
  passReqToCallback: true
, (req, access_token, refresh_token, profile, done)->
  session = req.session
  session.oauth = session.oauth || {}
  session.oauth.fb = session.oauth.fb || {}

  # if (session.oauth.fb.id)

  api.fb.executeMethod "/#{session.oauth.fb.id}/picture",
    access_token: access_token
    redirect: false
  .then (photo)->
    profile.photo = photo.data.url

    session.oauth.fb =
      id: profile.id
      profile: profile
      access_token: access_token
      refresh_token: refresh_token

    userQuery = if session.user?._id? then {_id: session.user._id}  else {'socials.fb.id': profile.id}

    db.models.User.findOneAsync userQuery
    .then (user)->
      log.info user

      unless user
        session.save ->
          done null, profile
      else
        user.socials = user.socials || {}
        user.socials.fb = session.oauth.fb

        user.saveAsync()
        .then ->
          session.oauth = user.socials
          session.settings = user.settings
          session.user = user

          session.save ->
            done null, profile
    .catch (err)->
      log.info 'err'
      log.error err
      session.save ->
        done null, profile

oauth.post '/login', (req, res, next)->
  session = req.session
  body = req.body

  if not body or not body.username or not body.password
    res.json
      status: 'error'
      error: 'Not all parameters are set'
  else

    log.debug body

    db.models.User.findOneAsync
      link: body.username
    .then (user)->
      return null unless user

      sha1pass = crypto.createHash 'sha1'
      sha1pass.update body.password, 'utf-8'
      digest = sha1pass.digest 'hex'

      log.debug digest
      log.trace user.password

      if user.password is digest
        return user
      else
        return null
    .then (user)->
      unless user
        session.save ->
          res.json
            status: 'error'
            error: 'No user found with such login/password'
      else
        session.settings = user.settings
        session.user = user
        session.oauth = user.socials
        session.save ->
          res.json
            status: 'ok'
            user: session.user
    .catch (err)->
      log.error err
      res.json
        status: 'error'
        error: err

oauth.get '/twitter', passport.authenticate 'twitter'
oauth.get '/twitter/callback', passport.authenticate 'twitter',
  successRedirect: '/success.html'
  failureRedirect: '/'

oauth.get '/vkontakte', passport.authenticate 'vkontakte'
oauth.get '/vkontakte/callback', passport.authenticate 'vkontakte',
  successRedirect: '/success.html'
  failureRedirect: '/'

oauth.get '/facebook', passport.authenticate 'facebook'
oauth.get '/facebook/callback', passport.authenticate 'facebook',
  successRedirect: '/success.html'
  failureRedirect: '/'

module.exports = oauth
