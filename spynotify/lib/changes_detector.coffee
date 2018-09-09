_           = require 'lodash'
sift4       = require 'sift-distance'
cheerio     = require 'cheerio'
CronJob     = require('cron').CronJob
db          = require dir 'db'
log         = require './log'
Promise     = require 'bluebird'
request     = require 'request'
moment      = require 'moment'
JSDiff      = require 'diff'
cheerio     = require 'cheerio'
sendmail    = Promise.promisify require('sendmail')()

request = Promise.promisify request

detectChanges = ->
  curDate = new Date

  db.models.Spy.findAll
    where:
      next_check_at:
        $lte: curDate
      type: config.spy.spyTypes.indexOf 'webpage'
  .then (spies)->
    spies = _.map spies, (spy)->
      spy.toJSON()

    log.debug spies

    Promise.each spies, (spy)->
      log.trace spy

      request
        url: spy.url
        encoding: null
        gzip: true
        headers:
          'User-Agent': spy.client.ua
          'Accept-Language': spy.client.al
      .spread (res, body)->
        body = body.toString()
        log.trace body
        updateData = {}
        updateData.last_checked = new Date
        updateData.next_check_at = new Date(Date.now() + spy.check_interval)

        unless spy.latest_version
          updateData.latest_version =
            html: body
        else
          diffCount = sift4(spy.latest_version.html, body)
          diffPercent = Math.floor diffCount / body.length * 100

        # log.debug "Sift4 distance is #{ sift4(spy.latest_version.html, body) }"
          updateData.latest_version = spy.latest_version
          updateData.latest_version.html = body

        db.models.Spy.find spy.id
        .tap (spy)->
          if diffCount
            updateData.user_notified = false

            spy.createEvent
              type: 'modified'
              diff:
                count: diffCount
                percent: diffPercent
        .then (spy)->
          log.debug spy
          if spy
            spy.updateAttributes updateData

        # log.trace body
      .catch (e)->
        log.error e



exports.startDetection = ->
  log.info 'Changes detector started...'
  new CronJob '*/10 * * * * *', ->
    detectChanges()
  , null, true, 'Europe/Moscow'


# class ChangesDetector
  # compare: ()
