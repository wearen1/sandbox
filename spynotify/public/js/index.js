(function() {
  $.fn.invertColor = function(duration) {
    var color;
    if (duration == null) {
      duration = 0;
    }
    if (!this.css('backgroundColor')) {
      return;
    }
    color = new RGBColor(this.css('backgroundColor'));
    if (!duration) {
      if (color.ok) {
        return this.css('color', 'rgb(' + (255 - color.r) + ',' + (255 - color.g) + ',' + (255 - color.b) + ')');
      }
    } else {
      return this.animate({
        color: 'rgb(' + (255 - color.r) + ',' + (255 - color.g) + ',' + (255 - color.b) + ')'
      }, duration);
    }
  };

  $(window).load(function() {
    var bgs, createData, createLogEvent, createSpy, preloadImage, showSettings, socket, toggleSwitchHandler;
    socket = io();
    moment.locale('ru');
    socket.on('data', function(data) {
      return console.log(data);
    });
    showSettings = function(data) {
      var a, wnd;
      a = document.createElement('a');
      a.href = $('#spy-url').val();
      if (createData.type === 'webelement') {
        wnd = window.open('', '_blank');
      }
      return socket.emit('action::new', {
        name: $('#spy-name').val(),
        type: createData.type,
        url: $('#spy-url').val(),
        interval: $('#spy-interval').val(),
        notify: {
          email: $('.spy-notify i').hasClass('fa-toggle-on')
        }
      }, function(result) {
        console.log(result);
        if ((result != null ? result.error : void 0) != null) {
          alert(result.error);
        } else {
          if (result.spy.type === 'webelement') {
            wnd.location = "http://" + result.spy.id + "." + a.hostname + "." + window.location.host;
            window.onbeforeunload = function() {
              return wnd.close();
            };
            window.onmessage = function(e) {
              return console.log(e);
            };
            socket.on('window::close', function(data) {
              return wnd.close();
            });
          }
        }
        $('.ui-effects-transfer').css({
          opacity: 0.9,
          display: 'block'
        });
        $('#create-spy').animate({
          opacity: 0,
          backgroundColor: '#fff'
        }, 800);
        return $('#create-spy').effect('transfer', {
          to: new_widget
        }, 800, function() {
          var _ref;
          $('.add-spy').toggleClass('ready');
          $('.shadow').toggleClass('invisible');
          return new_widget.animate({
            backgroundColor: ((_ref = result.spy) != null ? _ref.color : void 0) || '#ccc',
            borderColor: '#fff',
            opacity: 0.5
          }, 400, function() {
            $('#create-spy').hide();
            return createSpy(result.spy, new_widget);
          });
        });
      });
    };
    createSpy = function(data, item) {
      var bgContainer, bgCover, bgImg, container, delBtn, infoBlock, mOverHandler, setBtn, statusBtn, titleBlock, widget;
      if (item == null) {
        item = null;
      }
      if ((data != null ? data.error : void 0) != null) {
        alert(data.error);
      }
      container = $('.grid');
      widget = item || $('<div>').addClass('item');
      data.widget = widget;
      if ((data != null ? data.id : void 0) != null) {
        widget.data('id', data.id);
      }
      console.log(data);
      if (!data) {
        widget.fadeOut(400, function() {
          return widget.remove();
        });
        return;
      }
      widget.draggable({
        containment: container
      });
      widget.css({
        opacity: 0.5
      });
      if (!data.user_notified) {
        widget.addClass('active');
        mOverHandler = widget.mouseover(function() {
          return $(this).removeClass('active');
        });
      }
      if (!data.active) {
        widget.addClass('disabled');
      }
      bgContainer = $('<div>').addClass('bg-container');
      bgCover = $('<div>').addClass('bg-cover');
      bgImg = $('<div>').addClass('bg');
      bgContainer.append(bgImg);
      bgContainer.append(bgCover);
      widget.append(bgContainer);
      if (data.img) {
        console.log(bgImg);
        bgImg.css({
          backgroundColor: 'none',
          backgroundImage: "url('" + data.img + "')"
        });
      } else {
        bgImg.animate({
          backgroundColor: data.color
        }, 1000);
      }
      widget.invertColor(1000);
      infoBlock = $('<div>').addClass('info');
      statusBtn = $('<div>').addClass("i fa status " + (data.active ? 'fa-pause' : 'fa-play'));
      delBtn = $('<div>').addClass('i fa fa-remove delete');
      setBtn = $('<div>').addClass('i fa fa-gear settings');
      infoBlock.append(statusBtn);
      infoBlock.append(setBtn);
      infoBlock.append(delBtn);
      titleBlock = $('<div>').addClass("title centered horizontally " + (data.active ? '' : 'disabled'));
      titleBlock.text(data.custom_message);
      statusBtn.click(function() {
        if (data.active) {
          $(this).removeClass('fa-pause');
          $(this).addClass('fa-play');
          widget.addClass('disabled');
        } else {
          widget.removeClass('disabled');
          $(this).removeClass('fa-play');
          $(this).addClass('fa-pause');
        }
        data.active = !data.active;
        return socket.emit('action::edit', data, function(result) {});
      });
      widget.append(infoBlock);
      widget.append(titleBlock);
      widget.mouseenter(function() {
        var bg;
        bgCover = $(this).find('.bg-cover');
        bg = $(this).find('.bg');
        bgCover.css({
          opacity: 0.6
        });
        bg.addClass('blurred');
        infoBlock = $(this).find('.info');
        infoBlock.stop();
        return infoBlock.fadeIn();
      });
      widget.mouseleave(function() {
        var bg;
        bgCover = $(this).find('.bg-cover');
        bg = $(this).find('.bg');
        bg.removeClass('blurred');
        bgCover.css({
          opacity: 0
        });
        infoBlock = $(this).find('.info');
        infoBlock.stop();
        return infoBlock.fadeOut();
      });
      container.append(widget).packery('bindUIDraggableEvents', widget);
      container.packery('appended', widget);
      setBtn.click(function(e) {
        item = e.target.parentNode.parentNode;
        if (!$(item).hasClass('x2')) {
          $('.item').removeClass('x2');
        }
        $(item).toggleClass('x2');
        return container.packery();
      });
      delBtn.click(function(e) {
        if (confirm('Вы действительно хотите удалить шпиона?')) {
          item = $(e.target.parentNode.parentNode);
          return socket.emit('action::delete', item.data('id'), function(result) {
            return item.fadeOut(800, function() {
              item.remove();
              return container.packery();
            });
          });
        }
      });
      widget.draggable({
        containment: container
      });
      return container.packery('bindUIDraggableEvents', $('.grid .item'));
    };
    socket.emit('info::spies', function(data) {
      var container, i, _i, _len, _ref, _results;
      console.log(data);
      if (window.spynotify == null) {
        window.spynotify = {};
      }
      window.spynotify.spies = data;
      container = $('.grid');
      container.packery({
        itemSelector: '.item',
        gutter: 10,
        columnWidth: 120,
        rowHeight: 120,
        percentPosition: true
      });
      _ref = window.spynotify.spies;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        i = _ref[_i];
        _results.push(createSpy(i));
      }
      return _results;
    });
    createLogEvent = function(ev) {
      var a, border, desc, img, item, time;
      item = $('<div>').addClass('item');
      img = $('<img>').addClass('text-avatar fl_l');
      img.data('name', ev.spy.custom_message);
      a = $('<a>').addClass('name fl_l');
      a.attr({
        href: ev.spy.link,
        target: '_blank'
      });
      a.text(ev.spy.custom_message);
      time = $('<div>').addClass('time fl_r');
      time.text(ev.date);
      desc = $('<div>').addClass('desc fl_l');
      desc.text(ev.desc);
      border = $('<div>').addClass('border fl_l');
      item.append(img).append(a).append(time).append(desc).append(border);
      return $('#mCSB_1_container').append(item);
    };
    socket.emit('info::log', function(data) {
      var ev, inviteEv, _i, _len;
      if (!data.length) {
        inviteEv = {
          desc: 'Чтобы начать, создайте шпиона',
          date: moment().fromNow(moment()),
          spy: {
            link: 'http://spynotify.com/',
            custom_message: 'Spynotify'
          }
        };
        createLogEvent(inviteEv);
      } else {
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          ev = data[_i];
          createLogEvent(ev);
        }
      }
      $('.text-avatar').initial({
        charCount: 1,
        width: 72,
        height: 72
      });
      $('.activity-log').mCustomScrollbar('scrollTo', 'bottom');
      return console.log(data);
    });
    createData = {
      type: 'webpage',
      name: '',
      url: ''
    };
    $('.grid>.item').mouseenter(function(e) {
      var infoBlock;
      infoBlock = $(this).find('.info');
      infoBlock.stop();
      infoBlock.slideDown();
      return $('.grid>.item').mouseleave(function(e) {
        infoBlock.stop();
        return infoBlock.slideUp();
      });
    });
    $('#ready').click(function(e) {
      var a, wnd;
      a = document.createElement('a');
      a.href = $('#spy-url').val();
      if (createData.type === 'webelement') {
        wnd = window.open('', '_blank');
      }
      return socket.emit('action::new', {
        name: $('#spy-name').val(),
        type: createData.type,
        url: $('#spy-url').val(),
        interval: $('#spy-interval').val(),
        notify: {
          email: $('.spy-notify i').hasClass('fa-toggle-on')
        }
      }, function(result) {
        console.log(result);
        if ((result != null ? result.error : void 0) != null) {
          alert(result.error);
        } else {
          if (result.spy.type === 'webelement') {
            wnd.location = "http://" + result.spy.id + "." + a.hostname + "." + window.location.host;
            window.onbeforeunload = function() {
              return wnd.close();
            };
            window.onmessage = function(e) {
              return console.log(e);
            };
            socket.on('window::close', function(data) {
              return wnd.close();
            });
          }
        }
        $('.ui-effects-transfer').css({
          opacity: 0.9,
          display: 'block'
        });
        $('#create-spy').animate({
          opacity: 0,
          backgroundColor: '#fff'
        }, 800);
        return $('#create-spy').effect('transfer', {
          to: new_widget
        }, 800, function() {
          var _ref;
          $('.add-spy').toggleClass('ready');
          $('.shadow').toggleClass('invisible');
          return new_widget.animate({
            backgroundColor: ((_ref = result.spy) != null ? _ref.color : void 0) || '#ccc',
            borderColor: '#fff',
            opacity: 0.5
          }, 400, function() {
            $('#create-spy').hide();
            return createSpy(result.spy, new_widget);
          });
        });
      });
    });
    $('.back').click(function(e) {
      var step;
      step = $(this).data('currentStep');
      switch (step) {
        case 'page':
          $('.configure-page').hide();
          $('.type-select').fadeIn(400);
      }
      return console.log(step);
    });
    toggleSwitchHandler = function() {
      var i;
      i = $(this).find('i');
      if (i.hasClass('fa-toggle-on')) {
        i.removeClass('fa-toggle-on');
        i.addClass('fa-toggle-off');
        i.css({
          color: 'red'
        });
        return 'off';
      } else {
        i.removeClass('fa-toggle-off');
        i.addClass('fa-toggle-on');
        i.css({
          color: 'green'
        });
        return 'on';
      }
    };
    $('#type').click(function() {
      $('.type-select').hide();
      switch (createData.type) {
        case 'webpage':
          $('#ready').text('Готово');
          return $('.configure-page').fadeIn(400);
        case 'webelement':
          $('#ready').text('Выбрать элементы');
          return $('.configure-page').fadeIn(400);
      }
    });
    $('#webpage').click(function() {
      createData.type = 'webpage';
      $(this).addClass('active');
      $('#webelement').removeClass('active');
      $('.items-desc .webpage').fadeIn(400);
      $('.items-desc .webelement').hide();
      return $('.next').fadeIn(400);
    });
    $('#webelement').click(function() {
      createData.type = 'webelement';
      $(this).addClass('active');
      $('#webpage').removeClass('active');
      $('.items-desc .webpage').hide();
      $('.items-desc .webelement').fadeIn(400);
      return $('.next').fadeIn(400);
    });
    $('#filter-active').click(function() {
      var i, state, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _results, _results1;
      state = toggleSwitchHandler.call(this);
      if (state === 'on') {
        if (((_ref = window.spynotify) != null ? _ref.spies : void 0) != null) {
          _ref1 = window.spynotify.spies;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            i = _ref1[_i];
            if (!i.active) {
              _results.push(i.widget.css({
                display: 'none'
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      } else {
        if (((_ref2 = window.spynotify) != null ? _ref2.spies : void 0) != null) {
          _ref3 = window.spynotify.spies;
          _results1 = [];
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            i = _ref3[_j];
            if (!i.active) {
              _results1.push(i.widget.css({
                display: 'block'
              }));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }
      }
    });
    $('.spy-notify').click(function() {
      return toggleSwitchHandler.call(this);
    });
    $('#filter-type-pages').click(function() {
      var i, state, _base, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      state = toggleSwitchHandler.call(this);
      if (window.spynotify == null) {
        window.spynotify = {};
      }
      if ((_base = window.spynotify).filters == null) {
        _base.filters = {};
      }
      window.spynotify.filters.pages = state;
      if (state === 'on') {
        if (((_ref = window.spynotify) != null ? _ref.spies : void 0) != null) {
          _ref1 = window.spynotify.spies;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            i = _ref1[_i];
            if (i.type === 'webpage') {
              i.widget.css({
                display: 'block'
              });
            }
          }
        }
      } else {
        if (((_ref2 = window.spynotify) != null ? _ref2.spies : void 0) != null) {
          _ref3 = window.spynotify.spies;
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            i = _ref3[_j];
            if (i.type === 'webpage') {
              i.widget.css({
                display: 'none'
              });
            }
          }
        }
      }
      return $('.grid').packery();
    });
    $('#filter-type-elements').click(function() {
      var i, state, _base, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
      state = toggleSwitchHandler.call(this);
      if (window.spynotify == null) {
        window.spynotify = {};
      }
      if ((_base = window.spynotify).filters == null) {
        _base.filters = {};
      }
      window.spynotify.filters.elements = state;
      if (state === 'on') {
        if (((_ref = window.spynotify) != null ? _ref.spies : void 0) != null) {
          _ref1 = window.spynotify.spies;
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            i = _ref1[_i];
            if (i.type === 'webelement') {
              i.widget.css({
                display: 'block'
              });
            }
          }
        }
      } else {
        if (((_ref2 = window.spynotify) != null ? _ref2.spies : void 0) != null) {
          _ref3 = window.spynotify.spies;
          for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
            i = _ref3[_j];
            if (i.type === 'webelement') {
              i.widget.css({
                display: 'none'
              });
            }
          }
        }
      }
      return $('.grid').packery();
    });
    window.background = {
      darken: function() {
        return $('.shadow').addClass('hidden');
      }
    };
    preloadImage = function(src, cb) {
      var img;
      img = $('<img>').attr('src', src);
      img.remove();
      return img.load(cb);
    };
    bgs = ['/img/theme-1.jpg', '/img/theme-2.jpg'];
    $('#bgs').backstretch(bgs, {
      duration: 2e4,
      fade: 1e3
    });
    $('.activity-log').mCustomScrollbar({
      theme: 'dark'
    });
    return $('.add-spy').click(function() {
      var $ss, color, container;
      container = $('.grid');
      if (!$('.add-spy').hasClass('ready')) {
        window.new_widget = $('<div>').addClass('item new');
        $ss = $.stylesheet('.ui-effects-transfer');
        color = '#fff';
        $ss.css('background-color', color);
        container.packery('appended', new_widget);
        new_widget.draggable({
          containment: container
        });
        container.append(new_widget).packery('bindUIDraggableEvents', new_widget);
        $('#create-spy').show();
        return new_widget.animate({
          backgroundColor: color,
          borderColor: color
        }, 400, function() {
          $('.ui-effects-transfer').css({
            opacity: 0.9,
            backgroundColor: color
          });
          $('#create-spy').animate({
            opacity: 1,
            backgroundColor: color
          }, 800);
          return new_widget.effect('transfer', {
            to: $('#create-spy')
          }, 800, function() {
            new_widget.removeClass('new');
            $('.add-spy').toggleClass('ready');
            return $('.shadow').toggleClass('invisible');
          });
        });
      } else {
        $('.ui-effects-transfer').css({
          opacity: 0.9,
          display: 'block'
        });
        $('#create-spy').animate({
          opacity: 0,
          backgroundColor: '#fff'
        }, 800);
        return $('#create-spy').effect('transfer', {
          to: new_widget
        }, 800, function() {
          $('.add-spy').toggleClass('ready');
          $('.shadow').toggleClass('invisible');
          return new_widget.animate({
            backgroundColor: '#fff',
            borderColor: '#fff',
            opacity: 0.5
          }, 400, function() {
            $('#create-spy').hide();
            return new_widget.remove();
          });
        });
      }
    });
  });

}).call(this);
