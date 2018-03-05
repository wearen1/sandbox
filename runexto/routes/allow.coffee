lib = require '../lib'
db = require '../db'

_ = lib.get '_'
log = lib.log()
fs = lib.get 'fs'
path = lib.get 'path'
Promise = lib.get 'bluebird'

express = lib.get 'express'
allow = express.Router()

allow.get '/', (req, res, next)->
  db.models.AllowedIP.findOneAsync
    ip: req.ip
  .then (allowedIP)->
    if allowedIP
      allowedIP.remove()
    else
      allowedIP = new db.models.AllowedIP
        ip: req.ip
      allowedIP.saveAsync()
      .then ->
        res.redirect '/'

module.exports = allow
