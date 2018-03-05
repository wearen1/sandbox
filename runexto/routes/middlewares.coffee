# lib
lib = require '../lib'
db = require appRoot + '/db'
_ = lib.get '_'
# loggers
log = lib.log()
# toobusy module for handling too much requests
# https://github.com/lloyd/node-toobusy
toobusy = lib.get 'toobusy'
# geoip-lite
# https://github.com/bluesmoon/node-geoip
ip2loc = lib.get 'ip2location'

ip2loc.IP2Location_init appRoot + '/data/IP2LOCATION-LITE-DB3.BIN'

class Middlewares
  @middlewares =
    userHandler: (req, res, next)->
      session = req.session
      unless session.settings
        session.settings = (new db.models.User).settings
        session.save ->
          next()
      else
        next()
    csrfHandler: (err, req, res, next)->
      if err.code isnt 'EBADCSRFTOKEN'
        return next(err) err
      else
        res.status(403).json
          error: 'Invalid/expired token'
    csrf: (req, res, next)->
      res.cookie 'XSRF-TOKEN', req.csrfToken()
      next()
    toobusy: (req, res, next)->
      if toobusy()
        res.send 503, "Самое главное в жизни — выдержка.
        Умение отойти и постоять в сторонке, а
        потом спокойно занять стул."
      else
        next()
    health_check: (req, res, next)->
      if req.url is '/aws_health_check'
        res.status(200).end()
      else
        next()
    geo: (req, res, next)->
      if req.session? and not req.session.geo
        geodata = ip2loc.IP2Location_get_all req.ip

        req.session.geo = {
          city: geodata.city if geodata.city isnt '-'
          country_short: geodata.country_short if geodata.country_short isnt '-'
          country_long: geodata.country_long if geodata.country_long isnt '-'
          region: geodata.region if geodata.region isnt '-'
          latitude: geodata.latitude if geodata.latitude isnt 0
          longitude: geodata.longitude if geodata.longitude isnt 0
        }
      next()
    prevent_people: (req, res, next)->
      return next()
      # log.trace req.session.oauth.fb.profile

      if (req.originalUrl.indexOf 'allow') isnt -1
        next()
      else
        db.models.AllowedIP.findOneAsync
          ip: req.ip
        .then (allowed_ip)->
          if allowed_ip
            next()
          else
            res.status(500)
            res.end()
        .catch (e)->
          res.json
            status: 'error'
            error: e

  @apply: (app, middleWareNames)=>
    log.info 'Applying custom middlewares:', middleWareNames
    _.forEach middleWareNames, (middleWareName)=>
      app.use @middlewares[middleWareName] if _.has @middlewares, middleWareName

module.exports = Middlewares
