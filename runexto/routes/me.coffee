lib = require '../lib'
db = require '../db'

_ = lib.get '_'
log = lib.log()
fs = lib.get 'fs'
crypto = lib.get 'crypto'
path = lib.get 'path'
validate = lib.get 'validate'
Promise = lib.get 'bluebird'
Q = lib.get 'q'

validate.validators.exists = (value)->
  validate.Promise (resolve, reject)->
    db.models.User.count({link: value}).exec()
    .then (count)->
      if count is 0
        resolve()
      else
        reject "User with link " + value + " already exists"

express = lib.get 'express'
me = express.Router()

me.get '/', (req, res, next)->
  session = req.session

  session.oauth ||= {}

  if session.user
    res.json
      status: 'ok'
      settings: session.user.settings
      me: session.user
      session:
        vk: session.oauth.vk?
        fb: session.oauth.fb?
        tw: session.oauth.tw?
  else
    res.json
      status: 'error'
      error: 'Not registered'
      settings: (session || session.user).settings
      photos:
        vk: session.oauth?.vk?.profile?.photos[0]?.value
        tw: session.oauth?.tw?.profile?.photos[0]?.value
        fb: session.oauth?.fb?.profile?.photo
      session:
        vk: session.oauth.vk?
        fb: session.oauth.fb?
        tw: session.oauth.tw?

me.post '/logout', (req, res, next)->
  session = req.session
  session.oauth = session.auth = session.user = session.passport = null

  req.logout()
  session.destroy ->
    res.json
      status: 'ok'

me.post '/checkLogin', (req, res, next)->
  unless req.body.login
    res.json
      status: 'error'
      error: 'Login is not specified'
  else
  db.models.User.findOneAsync
    link: req.body.login
  .then (user)->
    if user
      result =
        status: 'ok'
        exists: true
    else
      result =
        status: 'ok'
        exists: false
  .then (result)->
    res.json result

me.post '/register', (req, res, next)->
  session = req.session

  if not (session.oauth?.vk? or session.oauth?.fb? or session.oauth?.tw?)
    res.json
      status: 'error'
      error: 'Need one network at least'

  params = req.body

  params.photo = switch params.photo
    when 'vk' then session.oauth?.vk?.profile?.photos[0]?.value
    when 'fb' then session.oauth?.fb?.profile?.photo
    when 'tw' then session.oauth?.tw?.profile?.photos[0]?.value

#  validate.async params, lib.constraints
#  .then ->

  sha1pass = crypto.createHash 'sha1'
  sha1pass.update params.password, 'utf-8'

  user_params =
    personal:
      name: params.name
      surname: params.surname
      photo: params.photo || ''
    link: params.link
    password: sha1pass.digest 'hex'
    socials:
      vk:
        id: null
        access_token: null
      tw:
        id: null
        token: null
        token_secret: null
      fb:
        id: null
        access_token: null
        refresh_token: null

  if session.oauth?.vk?
    user_params.socials.vk =
      id: session.oauth.vk.profile.id
      access_token: session.oauth.vk.profile.access_token
  if session.oauth?.tw?
    user_params.socials.tw =
      id: session.oauth.tw.profile.id
      token: session.oauth.tw.token
      token_secret: session.oauth.tw.token_secret
  if session.oauth?.fb?
    user_params.socials.fb =
      id: session.oauth.fb.profile.id
      access_token: session.oauth.fb.access_token
      refresh_token: session.oauth.fb.refresh_token

  user = new db.models.User user_params
  user.saveAsync()
  .then (user)->
    user = user[0]

    session.user = user
    session.save ->
      res.json
        status: 'ok'
        user: user
  .catch (e)->
    res.json
      status: 'error'
      error: e
  , (err)->
    res.json
      status: 'error'
      error: err

me.post '/upload_photo', (req, res, next)->
  session = req.session

  if not session or not session.user
    res.json
      status: 'error'
      error: 'Not registered'
  else
    db.models.User.findByIdAsync session.user._id
    .then (user)->
      req.pipe req.busboy
      req.busboy.on 'file', (fieldname, file, filename)->
        md5fname = crypto.createHash 'md5'
        md5fname.update filename, 'utf-8'

        img_prefix = appRoot + '/public'
        img_path = '/user_data/img/' + session.user._id + '_' + md5fname.digest('hex') + /\.(.*?)$/.exec(filename)[0]

        fstream = fs.createWriteStream img_prefix + img_path
        file.pipe fstream

        fstream.on 'close', ->
          user.personal.photo = img_path
          user.saveAsync ->
            session.user = user
            session.save ->
              res.status(200).end()
    .catch (err)->
      res.json
        status: 'error'
        error: err

#handling settings requests
me.get '/settings', (req, res, next)->
  session = req.session

  if session and session.settings
    res.json
      status: 'ok'
      settings: session.settings
  else
    res.json
      status: 'error'
      error: 'Not registered'

me.post '/settings', (req, res, next)->
  session = req.session

  if not session or not session.user
    u = new db.models.User
    u.settings = req.body
    session.settings = u.settings
    session.save ->
      res.json
        status: 'ok'
        settings:
          session.settings
  else
    if _.isEqual session.settings, req.body
      res.json
        status: 'error'
        error: 'Settings are the same'
    else
      db.models.User.findByIdAsync session.user._id
      .then (user)->
        user.settings = req.body
        user.saveAsync()
        .then ->
          user
      .then (user)->
        session.user = user
        session.settings = user.settings
        session.save ->
          res.json
            status: 'ok'
            settings:
              session.settings
      .catch (e)->
        res.json
          status: 'error'
          error: 'Not registered'
        log.error(e)


me.get '/bookmark/list', (req, res, next)->
  session = req.session

  if not session or not session.user
    res.json
      status: 'error'
      error: 'Not registered'
  else
    res.json
      status: 'ok'
      bookmarks: session.user.bookmarks

me.post '/bookmark/:url', (req, res, next)->
  session = req.session

  if not session or not session.user
    res.json
      status: 'error'
      error: 'Not registered'
  else
    if session.user.bookmarks.indexOf req.params.url is -1
      session.user.bookmarks.push req.params.url
      session.save ->
        db.models.User.findByIdAsync session.user._id
        .then (user)->
          user.bookmarks = session.user.bookmarks
          user.saveAsync ->
            res.json
              status: 'ok'
    else
      res.json
        status: 'error'
        error: 'Already in bookmarks'

me.delete '/bookmark/:url', (req, res, next)->
  session = req.session

  if not session or not session.user
    res.json
      status: 'error'
      error: 'Not registered'
  else
    unless session.user.bookmarks.indexOf req.params.url is -1
      _.pull session.user.bookmarks, req.params.url
      session.save ->
        db.models.User.findByIdAsync session.user._id
        .then (user)->
          user.bookmarks = session.bookmarks
          user.saveAsync ->
            res.json
              status: 'ok'

module.exports = me
