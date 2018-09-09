_           = require 'lodash'
Promise     = require 'bluebird'
moment      = require 'moment'
db          = require dir 'db'
url         = require 'url'
request     = Promise.promisifyAll require 'request'
cheerio     = require 'cheerio'
moment.locale 'ru'

module.exports = (io)->
  log.info 'applying socket'

  io.on 'connection', (socket)->
    log.info 'client connected'

    socket.on 'action::edit', (data, cb)->
      updateData = _.pick data, ['custom_message', 'active', 'url']
      db.models.Spy.update updateData,
        where:
          id: data.id
      .then (spy)->
        log.trace spy
        cb()

    socket.on 'info::spies', (cb)->
      db.models.Spy.findAll {}
      .then (spies)->
        spyIds = _.map spies, (spy)->
          spy.id

        Promise.resolve true
        .then ->
          if spyIds.length
            db.models.Spy.update
              user_notified: true
            ,
              where:
                id:
                  $in: spyIds
          else
            null
        .then ->
          cb spies


    socket.on 'info::log', (cb)->
      db.models.Event.findAll {}
      , order: '"createdAt" DESC'
      , limit: 20
      .then (events)->
        events = _.map events, (event)-> event.toJSON()

        spyIds = []

        _.forEach events, (event)->
          spyIds.push event.spyId unless event.spyId in spyIds

        db.models.Spy.findAll
          where:
            id:
              $in: spyIds
        .then (spies)->
          return cb [] unless spies

          Promise.map spies, (spy)->
            spy.getElements()
            .then (elements)->
              spy = spy.toJSON()
              spy.elements = _.map elements, (element)->element.toJSON()
              spy
          ,
            concurrency: 1
        .then (spies)->
          events = _.map events, (event)->
            event.date = moment(event.createdAt).fromNow()
            event.spy = _.find spies, (spy)->
              spy.id is event.spyId
            if event.spy.type is 'webpage'
              event.desc = "Изменилось содержимое страницы на #{ event.diff.percent }%"
            if event.spy.type is 'webelement'
              event.desc = "Изменился элемент #{ event.spy.elements[0].name }"
            event

          events = _(events).reverse().value()

          cb events

    socket.on 'action::delete', (id, cb)->
      db.models.Spy.destroy
        where:
          id: id
      .then ->
        log.debug 'deleted'
        cb()

    socket.on 'action::update', (data, cb)->
      log.trace data
      log.trace url.parse(data.url).hostname
      spyId = parseInt url.parse(data.url).hostname.split('.')[0]
      db.models.Spy.findOne spyId
      .then (spy)->
        re = /(http|https):\/\/\d*\.(.*)\.localhost\:3000\/(.*)/
        matches = re.exec data.url
        spy.url = "#{ matches[1] }://#{ matches[2] }/#{ matches[3] }"
        spy.save()
        .then ->
          spy.createElement
            name: data.name
            type: 'custom'
            selector: data.element
          .then (element)->
            log.debug element
            element.save()
            element

        .then ->
          socket.broadcast.emit 'window::close'
          cb true

    socket.on 'action::new', (data, cb)->
      ua = socket.request.headers['user-agent']
      al = socket.request.headers['accept-language']

      log.debug data
      error_messages = []

      unless (
        data.hasOwnProperty('type') and data.hasOwnProperty('url') and
        data.hasOwnProperty('interval') and data.hasOwnProperty('notify') and
        data.hasOwnProperty('name')
      )
        error_messages.push 'Заданы не все параметры'

      unless data.name
        error_messages.push 'Не задано имя шпиона'

      unless data.type in config.spy.spyTypes
        error_messages.push 'Неверный тип'

      unless typeof data.notify.email is 'boolean'
        error_messages.push 'Неверный тип оповещения'

      unless data.interval in config.spy.checkIntervals
        error_messages.push 'Неверно задан интервал оповещений'

      unless error_messages.length
        log.debug data

        # fetch og:image
        request.getAsync
          headers:
            'user-agent': ua
            'accept-language': al
          encoding: null
          gzip: true
          url: data.url
        .spread (res, body)->
          log.trace body
          $ = cheerio.load body

          Promise.resolve true
          .then ->
            ogImageMeta = $('meta[property="og:image"]')
            log.trace ogImageMeta
            log.trace $('meta[property="og:image"]')
            return if ogImageMeta then ogImageMeta.attr('content') else null
        .catch (e)->
          log.error e
          null
        .then (img)->
          db.models.Spy.create
            client:
              ua: ua
              al: al
            active: true
            img: img
            color: '#' + Math.floor(Math.random() * 16777215).toString(16)
            check_interval: data.interval
            custom_message: data.name
            type: data.type
            url: data.url
        .then (newSpy)->
          cb {
            id: socket.id
            status: 'ok'
            spy: newSpy
          }
        .catch (err)->
          cb {
            stats: 'error'
            error: 'Ошибка при создании шпиона'
          }
      else
        cb {
          status: 'error'
          error: error_messages[0]
        }
