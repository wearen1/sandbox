routes = [
  require './proxy.coffee'
  require './health.coffee'
  require './spy.coffee'
]


exports.routes = routes
exports.socket = require './spy_socket.coffee'
