$.fn.invertColor = (duration=0)->
  return unless @css 'backgroundColor'
  color = new RGBColor @css 'backgroundColor'
  unless duration
    @css('color', 'rgb(' + (255 - color.r) + ',' + (255 - color.g) + ',' + (255 - color.b) + ')') if color.ok
  else
    @animate
      color: 'rgb(' + (255 - color.r) + ',' + (255 - color.g) + ',' + (255 - color.b) + ')'
    , duration

$(window).load ->
  socket = io()
  moment.locale 'ru'

  socket.on 'data', (data)->
    console.log data


# $('#testFrame').attr 'src', '/proxy/' + encodeURIComponent "https://vk.com"

  # iframe#testFrame(width=400, height=400)

  showSettings = (data)->
    a = document.createElement 'a'
    a.href = $('#spy-url').val()

    wnd = window.open '', '_blank' if createData.type is 'webelement'

    socket.emit 'action::new',
      name: $('#spy-name').val()
      type: createData.type
      url: $('#spy-url').val()
      interval: $('#spy-interval').val()
      notify:
        email: $('.spy-notify i').hasClass 'fa-toggle-on'
    , (result)->
      console.log result


      if result?.error?
        alert result.error
      else
        if result.spy.type is 'webelement'
          wnd.location = "http://#{ result.spy.id }.#{ a.hostname }.#{ window.location.host }"

          window.onbeforeunload = ->
            wnd.close()

          window.onmessage = (e)->
            console.log e

          socket.on 'window::close', (data)->
            wnd.close()

      # new_widget.css
      #   backgroundColor: result.spy.color

      $('.ui-effects-transfer').css
        opacity: 0.9
        display: 'block'

      $('#create-spy').animate
        opacity: 0
        backgroundColor: '#fff'
      , 800

      $('#create-spy').effect 'transfer',
        to: new_widget
      , 800, ->
        $('.add-spy').toggleClass 'ready'
        $('.shadow').toggleClass 'invisible'

        new_widget.animate
          backgroundColor: result.spy?.color or '#ccc'
          borderColor: '#fff'
          opacity: 0.5
        , 400, ->
          $('#create-spy').hide()
          createSpy result.spy, new_widget


  createSpy = (data, item=null)->
    alert data.error if data?.error?

    container = $('.grid')
    widget = item or $('<div>').addClass 'item'
    data.widget = widget
    widget.data 'id', data.id if data?.id?

    console.log data
    unless data
      widget.fadeOut 400, ->
        widget.remove()
      return

    widget.draggable
      containment: container
    widget.css
      opacity: 0.5

    unless data.user_notified
      widget.addClass 'active'
      mOverHandler = widget.mouseover ->
        $(@).removeClass 'active'
        # $(@).off mOverHandler

    widget.addClass 'disabled' unless data.active


    bgContainer = $('<div>').addClass 'bg-container'

    bgCover = $('<div>').addClass 'bg-cover'
    bgImg = $('<div>').addClass 'bg'

    bgContainer.append bgImg
    bgContainer.append bgCover

    widget.append bgContainer

    if data.img
      console.log bgImg
      bgImg.css
        backgroundColor: 'none'
        backgroundImage: "url('#{data.img}')"
      # bgImg.attr 'src', data.img
    else
      bgImg.animate
        backgroundColor: data.color
      , 1000

    widget.invertColor 1000

      # .item
      #   .info
      #     i.fa.fa-remove.delete
      #     i.fa.fa-gear.settings
      #   .desc
      #   .title.centered.horizontally National Research University IFMO

    infoBlock = $('<div>').addClass 'info'

    statusBtn = $('<div>').addClass "i fa status #{ if data.active then 'fa-pause' else 'fa-play' }"
    delBtn = $('<div>').addClass 'i fa fa-remove delete'
    setBtn = $('<div>').addClass 'i fa fa-gear settings'


        # item.fadeOut 800, ->
          # item.remove()
          # container.packery()

    infoBlock.append statusBtn
    infoBlock.append setBtn
    infoBlock.append delBtn

    titleBlock = $('<div>').addClass "title centered horizontally #{ if data.active then '' else 'disabled' }"
    titleBlock.text data.custom_message

    statusBtn.click ->
      if data.active
        $(@).removeClass 'fa-pause'
        $(@).addClass 'fa-play'
        widget.addClass 'disabled'
      else
        widget.removeClass 'disabled'
        $(@).removeClass 'fa-play'
        $(@).addClass 'fa-pause'

      data.active = not data.active

      socket.emit 'action::edit', data, (result)->

    widget.append infoBlock
    widget.append titleBlock

    widget.mouseenter ->
      bgCover = $(@).find('.bg-cover')
      bg = $(@).find('.bg')
      bgCover.css
        opacity: 0.6
      bg.addClass 'blurred'

      infoBlock = $(@).find('.info')
      infoBlock.stop()
      infoBlock.fadeIn()

    widget.mouseleave ->
      bgCover = $(@).find('.bg-cover')
      bg = $(@).find('.bg')
      bg.removeClass 'blurred'

      bgCover.css
        opacity: 0
      infoBlock = $(@).find('.info')
      infoBlock.stop()
      infoBlock.fadeOut()

    container.append(widget).packery 'bindUIDraggableEvents', widget
    container.packery 'appended', widget

    setBtn.click (e)->
      item = e.target.parentNode.parentNode
      $('.item').removeClass 'x2' unless $(item).hasClass 'x2'
      $(item).toggleClass('x2')
      container.packery()

    delBtn.click (e)->
      if confirm 'Вы действительно хотите удалить шпиона?'
        item = $(e.target.parentNode.parentNode)

        socket.emit 'action::delete', item.data('id'), (result)->
          item.fadeOut 800, ->
            item.remove()
            container.packery()

    widget.draggable
      containment: container
    container.packery 'bindUIDraggableEvents', $('.grid .item')


  socket.emit 'info::spies', (data)->
    console.log data
    window.spynotify ?= {}
    window.spynotify.spies = data
    container = $('.grid')

    container.packery
      itemSelector: '.item'
      gutter: 10
      columnWidth: 120
      rowHeight: 120
      percentPosition: true

    for i in window.spynotify.spies
      createSpy i

  createLogEvent = (ev)->
    item = $('<div>').addClass 'item'
    img = $('<img>').addClass('text-avatar fl_l')
    img.data 'name', ev.spy.custom_message

    a = $('<a>').addClass 'name fl_l'
    a.attr
      href: ev.spy.link
      target: '_blank'
    a.text ev.spy.custom_message
    time = $('<div>').addClass 'time fl_r'
    time.text ev.date

    desc = $('<div>').addClass 'desc fl_l'
    desc.text ev.desc

    border = $('<div>').addClass 'border fl_l'
    item.append(img).append(a).append(time).append(desc).append(border)

    $('#mCSB_1_container').append item



  socket.emit 'info::log', (data)->
    # .item
      # img.text-avatar(data-name="Forbes").fl_l
      # a.name.fl_l(href="http://forbes.ru", target="_blank") Forbes
      # .time.fl_r 8 минут назад
      # .desc.fl_l Изменился элемент "комментарий"
      # .border.fl_l
    unless data.length
      inviteEv =
        desc: 'Чтобы начать, создайте шпиона'
        date: moment().fromNow(moment())
        spy:
          link: 'http://spynotify.com/'
          custom_message: 'Spynotify'
      createLogEvent inviteEv
    else
      for ev in data
        createLogEvent ev
    $('.text-avatar').initial
      charCount: 1
      width: 72
      height: 72

    $('.activity-log').mCustomScrollbar 'scrollTo', 'bottom'
    console.log data


  createData =
    type: 'webpage'
    name: ''
    url: ''

  $('.grid>.item').mouseenter (e)->
    infoBlock = $(@).find('.info')
    infoBlock.stop()
    infoBlock.slideDown()

    $('.grid>.item').mouseleave (e)->
      infoBlock.stop()
      infoBlock.slideUp()

  $('#ready').click (e)->
    a = document.createElement 'a'
    a.href = $('#spy-url').val()

    wnd = window.open '', '_blank' if createData.type is 'webelement'

    socket.emit 'action::new',
      name: $('#spy-name').val()
      type: createData.type
      url: $('#spy-url').val()
      interval: $('#spy-interval').val()
      notify:
        email: $('.spy-notify i').hasClass 'fa-toggle-on'
    , (result)->
      console.log result


      if result?.error?
        alert result.error
      else
        if result.spy.type is 'webelement'
          wnd.location = "http://#{ result.spy.id }.#{ a.hostname }.#{ window.location.host }"

          window.onbeforeunload = ->
            wnd.close()

          window.onmessage = (e)->
            console.log e

          socket.on 'window::close', (data)->
            wnd.close()

      # new_widget.css
      #   backgroundColor: result.spy.color

      $('.ui-effects-transfer').css
        opacity: 0.9
        display: 'block'

      $('#create-spy').animate
        opacity: 0
        backgroundColor: '#fff'
      , 800

      $('#create-spy').effect 'transfer',
        to: new_widget
      , 800, ->
        $('.add-spy').toggleClass 'ready'
        $('.shadow').toggleClass 'invisible'

        new_widget.animate
          backgroundColor: result.spy?.color or '#ccc'
          borderColor: '#fff'
          opacity: 0.5
        , 400, ->
          $('#create-spy').hide()
          createSpy result.spy, new_widget
          # new_widget.remove()


  $('.back').click (e)->
    step = $(@).data 'currentStep'

    switch step
      when 'page'
        $('.configure-page').hide()

        $('.type-select').fadeIn 400

    console.log step


  toggleSwitchHandler = ->
    i = $(@).find 'i'
    if i.hasClass 'fa-toggle-on'
      i.removeClass 'fa-toggle-on'
      i.addClass 'fa-toggle-off'
      i.css
        color: 'red'
      return 'off'
    else
      i.removeClass 'fa-toggle-off'
      i.addClass 'fa-toggle-on'
      i.css
        color: 'green'
      return 'on'

  $('#type').click ->
    $('.type-select').hide()

    switch createData.type
      when 'webpage'
        $('#ready').text 'Готово'
        $('.configure-page').fadeIn 400
      when 'webelement'
        $('#ready').text 'Выбрать элементы'
        $('.configure-page').fadeIn 400
      # when 'webelement'

  $('#webpage').click ->
    createData.type = 'webpage'

    $(@).addClass 'active'
    $('#webelement').removeClass 'active'
    $('.items-desc .webpage').fadeIn 400
    $('.items-desc .webelement').hide()

    $('.next').fadeIn 400


  $('#webelement').click ->
    createData.type = 'webelement'

    $(@).addClass 'active'
    $('#webpage').removeClass 'active'
    $('.items-desc .webpage').hide()
    $('.items-desc .webelement').fadeIn 400

    $('.next').fadeIn 400


  $('#filter-active').click ->
    state = toggleSwitchHandler.call @
    if state is 'on'
      if window.spynotify?.spies?
        for i in window.spynotify.spies
          unless i.active
            i.widget.css
              display: 'none'
    else
      if window.spynotify?.spies?
        for i in window.spynotify.spies
          unless i.active
            i.widget.css
              display: 'block'

  $('.spy-notify').click ->
    toggleSwitchHandler.call @

  $('#filter-type-pages').click ->
    state = toggleSwitchHandler.call @
    window.spynotify ?= {}
    window.spynotify.filters ?= {}
    window.spynotify.filters.pages = state

    if state is 'on'
      if window.spynotify?.spies?
        for i in window.spynotify.spies
          if i.type is 'webpage'
            i.widget.css
              display: 'block'
    else
      if window.spynotify?.spies?
        for i in window.spynotify.spies
          if i.type is 'webpage'
            i.widget.css
              display: 'none'
    $('.grid').packery()


  $('#filter-type-elements').click ->
    state = toggleSwitchHandler.call @
    window.spynotify ?= {}
    window.spynotify.filters ?= {}
    window.spynotify.filters.elements = state

    if state is 'on'
      if window.spynotify?.spies?
        for i in window.spynotify.spies
          if i.type is 'webelement'
            i.widget.css
              display: 'block'
    else
      if window.spynotify?.spies?
        for i in window.spynotify.spies
          if i.type is 'webelement'
            i.widget.css
              display: 'none'
    $('.grid').packery()


  window.background =
    darken: ->
      $('.shadow').addClass 'hidden'

  preloadImage = (src, cb)->
    img = $('<img>').attr 'src', src
    img.remove()
    img.load cb

  bgs = ['/img/theme-1.jpg', '/img/theme-2.jpg']

  $('#bgs').backstretch bgs,
    duration: 2e4
    fade: 1e3

  $('.activity-log').mCustomScrollbar
    theme: 'dark'

  $('.add-spy').click ->
    container = $('.grid')
    unless $('.add-spy').hasClass 'ready'
      window.new_widget = $('<div>').addClass('item new')

      $ss = $.stylesheet '.ui-effects-transfer'

      # color = '#'+Math.floor(Math.random()*16777215).toString(16)
      color = '#fff'
      $ss.css 'background-color', color

      container.packery 'appended', new_widget
      new_widget.draggable
        containment: container
      container.append(new_widget).packery 'bindUIDraggableEvents', new_widget


      $('#create-spy').show()

      new_widget.animate
        backgroundColor: color
        borderColor: color
      , 400, ->

        $('.ui-effects-transfer').css
          opacity: 0.9
          backgroundColor: color

        $('#create-spy').animate
          opacity: 1
          backgroundColor: color
        , 800

        new_widget.effect 'transfer',
          to: $('#create-spy')
        , 800, ->
          new_widget.removeClass 'new'

          $('.add-spy').toggleClass 'ready'
          $('.shadow').toggleClass 'invisible'
    else
      $('.ui-effects-transfer').css
        opacity: 0.9
        display: 'block'

      $('#create-spy').animate
        opacity: 0
        backgroundColor: '#fff'
      , 800

      $('#create-spy').effect 'transfer',
        to: new_widget
      , 800, ->
        $('.add-spy').toggleClass 'ready'
        $('.shadow').toggleClass 'invisible'

        new_widget.animate
          backgroundColor: '#fff'
          borderColor: '#fff'
          opacity: 0.5
        , 400, ->
          $('#create-spy').hide()
          new_widget.remove()
