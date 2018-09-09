Promise = require 'bluebird'
fs = Promise.promisifyAll require 'fs'
zlib = Promise.promisifyAll require 'zlib'

request = Promise.promisify require 'request'
cheerio = require 'cheerio'
reltoabs = require('reltoabs').reltoabs
inline = Promise.promisifyAll require 'web-resource-inliner'

encoding = require 'encoding'
Iconv = require('iconv').Iconv
Buffer = require('buffer').Buffer

express = require 'express'
spy = express.Router()


spy.get '/', (req, res, next)->
  log.info 'here'
  res.render 'index'


module.exports =
  router  : spy
  path    : '/'
