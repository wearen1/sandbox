_             = require 'lodash'
fs            = require 'fs'
# Spooky        = require 'spooky'
request       = require 'request'
Promise       = require 'bluebird'
log           = require './log'
promise_while = require './promise_while'
db            = require dir 'db'
jade          = Promise.promisifyAll require 'jade'
moment        = require 'moment'
nodemailer    = require 'nodemailer'
transporter   = nodemailer.createTransport()
Browser       = require 'zombie'





browser = new Browser()




getElementContent = (elementId, img_version, url, selector, client)->
  log.debug client
  new Promise (resolve, reject)->

    spooky = new Spooky
      child:
        "ssl-protocol": "tlsv1"
        "ignore-ssl-errors": true
        "web-security": "no"
      casper:
        pageSettings:
          userAgent: client.ua
          headers:
            'Accept-Language': client.al
        logLevel: 'info'
        verbose: true
        options:
          clientScripts: [dir 'public/bower_components/jquery/dist/jquery.min.js']
      , (err)->
        if err
          log.error e
        else
          spooky.start url

          spooky.then [
            selector: selector
            elementId: elementId
            img_version: img_version
          , ->

            element = @evaluate (selector)->
              if $(selector)
                result =
                  html: $(selector).html()
                  rect: $(selector)[0].getBoundingClientRect()
              else
                null
            ,
              selector: selector

            if element
              @capture "./public/img/elements/#{ elementId }-#{ img_version }.png", element.rect
              @emit "content", element.html
            else
              @emit 'content', ''
          ]

          spooky.run()


    spooky.on 'error', (e, stack)->
      log.error e
      log.trace stack

      reject()

    spooky.on 'content', (content)->
      result =
        url: url
        elementId: elementId
        selector: selector
        client: client
        html: content
        img: dir "public/img/elements/#{ elementId }-#{ img_version }.png"

      resolve result

    spooky.on 'console', (line)->
      log.trace line

    spooky.on 'log', (log)->
      if log.space is 'remote'
        log.info log.message.replace(/\-.*/, '')


promise_while ->
  Promise.resolve true
  .delay 1e4
, ->
  new Promise (resolve, reject)->
    promise_arr = []

    curDate = new Date

    db.models.Spy.findAll
      where:
        next_check_at:
          $lte: curDate
        type: config.spy.spyTypes.indexOf 'webelement'
    .then (spies)->
      spies_j = _.map spies, (spy)->spy.toJSON()
      Promise.map spies, (spy)->
        spy.getElements()
        .then (elements)->
          elements = _.map elements, (elem)->elem.toJSON()
          spy.elements = elements
          spy = spy.toJSON()
          spy.elements = elements
          spy
      ,
        concurrency: 1
      .then (spies)->
        Promise.map spies, (spy)->
          Promise.map spy.elements, (element)->
            log.trace spy
            getElementContent element.id, element.img_version, spy.url, element.selector, spy.client
            .then (content)->
              unless element.latest_version
                element.latest_version =
                  html: content.html
                db.models.Element.update
                  latest_version: element.latest_version
                ,
                  where:
                    id: element.id
              else
                if element.latest_version.html isnt content.html
                  db.models.Element.findOne element.id
                  .then (element)->
                    element.img_version += 1
                    element.latest_version =
                      html: content.html
                    element.save()
                    .then ->
                      element.createEvent
                        spyId: spy.id
                        type: if content.html.length then 'modified' else 'deleted'
                      .then ->
                        log.trace spy
                        element = element.toJSON()

                        moment.locale 'ru'
                        fn = jade.compileFile dir 'views/email.jade'

                        html = fn
                          spy: spy
                          moment: moment
                          type: if content.html.length then 'modified' else 'deleted'
                          element: element

                        transporter.sendMail
                          from: 'Spynotify <notify@spynotify.com>'
                          to: '@gmail.com' # put email here
                          subject: 'Изменение страницы'
                          html: html
                          attachments: [
                            {
                              cid: 'logo'
                              filename: 'logo.png'
                              path: dir 'public/img/logo-full.png'
                            }, {
                              cid: 'left'
                              filename: 'left.png'
                              path: dir "public/img/elements/#{ element.id }-#{ element.img_version - 2 }.png"
                            }, {
                              cid: 'right'
                              filename: 'right.png'
                              path: dir "public/img/elements/#{ element.id }-#{ element.img_version - 1 }.png"
                            }, {
                              cid: 'arrow'
                              filename: 'arrow.png'
                              path: dir "public/img/arrow.png"
                            }
                          ]

            .then ->
              updateData = {}
              updateData.last_checked = new Date
              updateData.next_check_at = new Date(Date.now() + spy.check_interval)

              db.models.Spy.update updateData,
                where:
                  id: spy.id
          ,
            concurrency: 1
        ,
         concurrency: 3
      .then ->
        resolve()



