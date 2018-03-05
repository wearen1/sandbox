fs = require 'fs'
cluster = require 'cluster'
watch = require 'node-watch'
path = require 'path'

if cluster.isMaster
  cluster.fork()

  cluster.on 'exit', (worker)->
    console.log 'worker', worker.id, 'exited'
    cluster.fork()
else
  require __dirname + '/app.coffee'

  watch ['app', 'lib', 'app.coffee', 'config', 'routes'],
    recursive: true
  , (filename)->
    if (/\.(coffee|yml)$/.test filename)
      console.log filename, 'changed'
      process.exit 1
