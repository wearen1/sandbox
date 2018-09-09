Promise = require 'bluebird'
fs = Promise.promisifyAll require 'fs'
zlib = Promise.promisifyAll require 'zlib'
url = require 'url'

request = Promise.promisify require 'request'
cheerio = require 'cheerio'
reltoabs = require('reltoabs').reltoabs
inline = Promise.promisifyAll require 'web-resource-inliner'

charset = require 'charset'
encoding = require 'encoding'
charsetDetector = require "node-icu-charset-detector"
Iconv = require('iconv').Iconv
Buffer = require('buffer').Buffer

express = require 'express'
proxy = express.Router()


class ProxyParser
  convertEncodingToUTF8 = (res, body)->
    try
      possibleCharset = charset res.headers, body

      buffer = new Buffer body
      icuCharset = charsetDetector.detectCharset(buffer).toString()

      log.trace possibleCharset or icuCharset

      charsetConverter = new Iconv possibleCharset or icuCharset, 'utf8'
      charsetConverter.convert(buffer).toString()
    catch e
      body


  @getContent: (url, headers)->
    log.debug headers
    request
      headers: headers
      url: url
      encoding: null
      gzip: true
    .spread (res, body)->
      getResult = ->
        result =
          body: convertEncodingToUTF8 res, body
          binary: false
          html: /(html)/.test res.headers['content-type']
          headers: res.headers

      if /(text|xml|json|csv|html|application)/.test res.headers['content-type']
        if res.headers['content-encoding'] is 'gzip'
          zlib.unzipAsync new Buffer body
          .then (body)->
            getResult()
          .catch (e)->
            getResult()
        else
          getResult()
      else
        result =
          body: body
          binary: true
          html: false
          headers: res.headers
    .catch (e)->
      log.error e
      null


proxy.use (req, res, next)->
  log.trace 'there'

  spiderId = req.hostname.match(/(\d*)\.(.*)\.(deathstar\.local|runexto\.com)$/)[1]
  host = req.hostname.match(/(\d*)\.(.*)\.(deathstar\.local|runexto\.com)$/)[2]
  path = req.originalUrl

  pageUrl = url.resolve 'http://' + host, path

  userHeaders =
    'User-Agent': req.headers['user-agent']

  ProxyParser.getContent pageUrl, req.headers
  .then (data)->
    return res.status(404).end() unless data

    ct = data.headers['content-type']
    for k of data.headers
      if /content/.test k
        delete data.headers[k]
    data.headers['content-type'] = ct if ct
    res.set data.headers

    res.header 'Cache-Control', 'private, no-cache, no-store, must-revalidate'
    res.header 'Expires', '-1'
    res.header 'Pragma', 'no-cache'

    if data.html
      $ = cheerio.load data.body
      if process.env.NODE_ENV is 'production'
        $('head').prepend $('<script src="http://spynotify.runexto.com/js/spynotify-loader.js" charset="UTF-8">')
      else
        $('head').prepend $('<script src="http://deathstar.local:3000/js/spynotify-loader.js" charset="UTF-8">')
      data.body = $.html()

    res.end data.body, 'utf8'



module.exports =
  subdomain: /.*(deathstar\.local|spynotify\.runexto\.com)$/
  router  : proxy
  path    : '/'
