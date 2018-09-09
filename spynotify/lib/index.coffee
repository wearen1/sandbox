path          = require 'path'
global.dir    = (name)->
  path.resolve path.join __dirname, '..', name

exports.normalizePort = (val)->
  port = parseInt val, 10
  return val if isNaN port
  return port if port >= 0
  return false

exports.promise_while = require './promise_while'
exports.log           = require './log'
