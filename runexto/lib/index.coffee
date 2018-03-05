module.exports =
  log: (name = null)->
    (require './log').getLogger(name)
  constraints: require ('./constraints')
  ext:
    _: require 'lodash'
    bluebird: require 'bluebird'
    bodyParser: require 'body-parser'
    busboy: require 'connect-busboy'
    config: (require 'konfig')()
    connectRedis: require 'connect-redis'
    cookieParser: require 'cookie-parser'
    crypto: require 'crypto'
    csrf: require 'csurf'
    express: require 'express'
    expressSession: require 'express-session'
    fs: require 'fs'
    helmet: require 'helmet'
    log4js: require 'log4js'
    moment: require 'moment'
    mongodb: require 'mongodb'
    mongoose: require 'mongoose'
    mongooseCache: require 'mongoose-cache'
    mongooseFindOrCreate: require 'mongoose-findorcreate'
    morgan: require 'morgan'
    nodeTwitter: require 'node-twitter'
    passport: require 'passport'
    passportFacebook: require 'passport-facebook'
    passportLocal: require 'passport-local'
    passportTwitter: require 'passport-twitter'
    passportVkontakte: require 'passport-vkontakte'
    path: require 'path'
    qs: require 'querystring'
    q: require 'q'
    request: require 'request'
    toobusy: require 'toobusy-js'
    aws: require 'aws-sdk'
    validate: require 'validate.js'
    wikipedia: require 'wikipedia-js'
    wiki: require 'wikijs'
    xml2json: require 'xml2json'
    ip2location: require 'ip2location-nodejs'

  get: (name)->
    if @.ext.hasOwnProperty name
      return @.ext[name]
    else
      throw new Error 'Module ' + name + ' not found'
