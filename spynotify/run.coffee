_                 = require 'lodash'
fs                = require 'fs'
cluster           = require 'cluster'
watch             = require 'node-watch'
path              = require 'path'
os                = require 'os'
lib               = require './lib'
global.log        = lib.log
global.config     = require('konfig')()
Promise           = require 'bluebird'
global.Sequelize  = require 'sequelize'

global.dir    = (name)->
  path.resolve path.join __dirname, name

log.info "Environment is #{ process.env.NODE_ENV }"

global.sequelize = new Sequelize config.db.pg.database, config.db.pg.user, config.db.pg.password,
    host: config.db.pg.host
    dialect: 'postgres'

syncModels = ->
  log.info 'Syncing models:'

  # TODO: add migrations
  # return Promise.resolve true


  models = (require './db').models
  modelsArray = []

  for modelName of models
    log.info "\t#{ modelName }"
    modelsArray.push models[modelName]
  Promise.each modelsArray, (model)->
    model.sync()
#      force: true - drops tables


if cluster.isMaster
  syncModels()
  .then ->
    (require './lib/changes_detector').startDetection()
    (require './lib/elements_watcher')
  .then ->
    cores = os.cpus().length
    log.info "You have #{ cores } cores"
  #  for core in [1 .. 1]
    cluster.fork()

    cluster.on 'exit', (worker)->
      log.info "Worker #{ worker.id } killed"
      cluster.fork()
  .catch (err)->
    log.error err

    process.exit()
else
  require './start.coffee'

  watch ['app.coffee', 'run.coffee', 'start.coffee', 'lib', 'app.coffee', 'config', 'routes', 'db'],
    recursive: true
  , (filename)->
    if /\.(coffee|yml)$/.test filename
      log.info "#{ filename } changed"
      process.exit 1
