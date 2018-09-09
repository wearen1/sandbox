_                 = require 'lodash'
app               = require './app'
http              = require 'http'
config            = (require 'konfig')()
redis             = require('socket.io-redis')
ios               = require 'socket.io-express-session'

#globals
global.lib = require './lib'
global.log = lib.log

port = lib.normalizePort process.env.PORT or config.app.port

server = http.createServer app
server.listen port

global.io = require('socket.io')(server)

# io.adapter redis
#   host: config.db.redis.host
#   port: config.db.redis.port

(require './routes').socket(io)

onError = (error)->
  throw error unless error.syscall is 'listen'
  bind = if typeof port is 'string' then "Pipe #{ port }" else "Port #{ port }"
  switch error.code
    when 'EACCESS'
      log.error "#{ bind } requires elevated privileges"
      process.exit 1
    when 'EADDRINUSE'
      log.error "#{ bind } is already in use"
      process.exit 1
    else
      throw error

onListening = ->
  addr = server.address()
  bind = if typeof addr is 'string' then "Pipe #{ addr }" else "Port #{ addr.port }"
  log.debug "Listening on #{ bind }"

server.on 'error', onError
server.on 'listening', onListening
