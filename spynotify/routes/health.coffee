Promise         = require 'bluebird'
fs              = Promise.promisifyAll require 'fs'
express         = require 'express'
health          = express.Router()

health.get '/', (req, res, next)->
  # res.render 'email'
  res.status 200
  .end()

module.exports =
  router  : health
  path    : '/health'
