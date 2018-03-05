path = require 'path'
global.appRoot = path.resolve __dirname

lib = require './lib'
db = require './db'


###
# external libraries
###
_ = lib.get '_'
express = lib.get 'express'
session = lib.get 'expressSession'
RedisStore = (lib.get 'connectRedis')(session)
passport = lib.get 'passport'
helmet = lib.get 'helmet'
bodyParser = lib.get 'bodyParser'
busboy = lib.get 'busboy'
csrf = lib.get 'csrf'
toobusy = lib.get 'toobusy'
morgan = lib.get 'morgan'
Promise = lib.get 'bluebird'
cookieParser = lib.get 'cookieParser'

mongodb = Promise.promisifyAll lib.get 'mongodb'
mongoose = Promise.promisifyAll lib.get 'mongoose'

MongoClient = mongodb.MongoClient
###
  #
###


###
# express initialization
###
global.config = lib.get 'config'
log = lib.log()
app = express()

sessionParams =
  name: '_rid'
  store: new RedisStore
    host: config.app.redis.host
    port: parseInt config.app.redis.port
    disableTTL: true
    db: 0
  secret: config.app.cookie_secret
  saveUninitialized: false
  resave: false

# sessionParams.cookie.secure = true if process.env.NODE_ENV is 'production'
app.use helmet.hsts
  maxAge: 10886400000
  includeSubdomains: true
  preload: true

app.use helmet.hidePoweredBy
  setTo: 'PHP/3.11564'

app.use helmet.ieNoOpen()
app.use helmet.noSniff()
app.use helmet.noCache()
app.use helmet.frameguard 'deny'
app.use helmet.crossdomain()
app.use helmet.xssFilter()

app.use express.static 'public'
app.use cookieParser()
app.use bodyParser.json()
app.use session sessionParams
app.use passport.initialize()
app.use passport.session()
app.use busboy()
app.use csrf()

app.set 'views', path.join __dirname, 'views'
app.set 'view engine', 'jade'
app.enable 'trust proxy'
###
  #
###

Promise.props
  mc: MongoClient.connectAsync "mongodb://#{config.app.mongo}:27017/runexto_node_#{process.env.NODE_ENV}"
  moc: mongoose.connectAsync "mongodb://#{config.app.mongo}:27017/runexto_node_#{process.env.NODE_ENV}"

.then (data)->
  global.mc = data.mc
  global.moc = data.moc

  log.info "connected to mongodb://#{config.app.mongo}:27017/runexto_node_#{process.env.NODE_ENV}"

  #app listener
  server = app.listen config.app.port, '0.0.0.0', ->
    log.info 'NODE_ENV is:', process.env.NODE_ENV
    log.info 'Runexto is running on port', config.app.port

  ###
  # middlewares
  ###
  runexto = require './routes'
  # app.use morgan 'dev'
  runexto.middlewares.apply app, ['csrf', 'csrfHandler', 'toobusy', 'geo', 'health_check', 'userHandler', 'prevent_people']

  #using runexto routes
  for router of runexto.routes
    router = runexto.routes[router]
    app.use router.path, router.route if router.path?

  #bypass angular '#'
  _.forEach runexto.angular_routes, (angular_router)->
    app.get "/#{angular_router}", (req, res, next)->
      res.redirect "/##{angular_router}"
  ###
    #
  ###

  #welcome page
  app.get '/welcome', (req, res, next)->
    res.sendFile appRoot + '/public/runexto/welcome/welcome.html'


  app.get '/', (req, res, next)->
    unless req.cookies.watched_welcome
      res.sendFile appRoot + '/public/runexto/welcome/welcome.html'
    else
      res.sendFile appRoot + '/public/start.html'

  #on process exit
  process.on 'SIGINT', ->
    server.close()
    toobusy.shutdown()
    process.exit()

.catch (err)->
  log.error err
