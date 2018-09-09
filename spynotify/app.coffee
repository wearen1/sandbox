_             = require 'lodash'
express       = require 'express'
path          = require 'path'
compression   = require 'compression'
favicon       = require 'serve-favicon'
logger        = require 'morgan'
cookieParser  = require 'cookie-parser'
bodyParser    = require 'body-parser'
helmet        = require 'helmet'
csurf         = require 'csurf'
cors          = require 'cors'
routes        = require './routes'
db            = require dir './db'

# css
stylus        = require 'stylus'
nib           = require 'nib'
#coffee middleware
coffee        = require 'connect-coffee-script'

app = express()

app.set 'views', path.join __dirname, 'views'
app.set 'view engine', 'jade'

class Subdomain
  constructor: (re, cb)->
    return (req, res, next)->
      return next() unless req.subdomains.length

      cb req, res, next

      # subdomain = req.subdomains.reverse().join '.'

      # log.debug subdomain

      # if re.test subdomain
      #   cb req, res, next
      # else
      #   next()


app.use compression()

corsWhitelist = ['http://deathstar.local:3000', 'http://spynotify.runexto.com']

corsOptions =
  origin: (origin, callback)->
    originIsWhitelisted = whitelist.indexOf(origin) isnt -1
    callback null, originIsWhitelisted

app.options '*', cors(corsOptions)

#app.use favicon __dirname + '/public/favicon.ico'
# app.use helmet()
# app.use logger 'dev'

app.use bodyParser.json()
app.use bodyParser.urlencoded
  extended: false
app.use cookieParser()

app.use coffee
  src: dir 'public'

app.use stylus.middleware
  src: dir 'public'
  compile: (str, path)->
    stylus str
    .set 'filename', path
    .set 'compress', false
    .use nib()
app.use express.static dir 'public'


app.use (err, req, res, next)->
   return next err unless err.code is 'EBADCSRFTOKEN'
   res.status 403
   res.send 'Invalid token'

app.use csurf
  cookie: true

log.info 'Applying routes:'
for route in routes.routes
  if route.subdomain
    log.info "\t#{ route.subdomain }"
    log.info "\t\t#{ route.path }"
    app.use new Subdomain(route.subdomain, route.router)
  else
    log.info "\t#{ route.path }"
    app.use route.path, route.router

app.use (req, res, next)->
  err = new Error 'Not Found'
  err.status = 404
  next err

if app.get 'env' is 'development'
  app.use (err, req, res, next)->
    res.status err.status or 500
    res.render 'error',
      message: err.message
      error:   err
app.use (err, req, res, next)->
  res.status err.status or 500
  res.render 'error',
    message: err.message
    error:   {}

module.exports = app
