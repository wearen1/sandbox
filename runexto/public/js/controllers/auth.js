runexto.controller('AuthCtrl', ['ClientService', '$window', '$scope', '$rootScope', '$http', 'FileUploader', '$state', '$translate', function (client, $window, $scope, $rootScope, $http, FileUploader, $state, $translate) {
  console.log(client);

  var setTheme = function (id) {
    var css = $('#css');
    css.remove();

    css = $('<link>').attr({
      id:   'css',
      rel:  'stylesheet',
      href: '/css/themes/' + id + '.css'
    })
    .appendTo('head');

    $('.active-theme').remove();
    $('#set-theme-' + id).append('<div class="fl_r active-theme"></div>');

    $(document.body).attr('class', 'theme_' + id);
  };

  client.get()
  .then(function (user){
    $scope.user = user;

    setTheme(user.settings.theme);
    setWorm(500, true);

    $translate.use(user.settings.lang);

    $scope.$watch(function(){
      return user.settings.lang;
    }, function(){
      $translate.use(user.settings.lang);
    });

    $scope.$watch(function(){
      return user.settings.theme;
    }, function(){
      setTheme(user.settings.theme);
    });


    $scope.$watch(function(){
      return $scope.user.settings.interface.show_top_menu;
    }, function(){
      setWorm(500);
    });

    $scope.$watch(function(){
      return JSON.stringify($scope.user);
    }, function(){
      console.log('changed');
      client.set(user);
    });

  });

  $scope.register = {};

  $scope.uploader = new FileUploader({
    queueLimit: 1,
    url:        '/me/upload_photo',
    filters:    [{
      name: 'imageFilter',
      fn:   function (item /*{File|FileLikeObject}*/, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|'.indexOf(type) !== -1;
      }
    }]
  });

  $scope.getMenuStatus = function(name){
    var div = $('#' + name);
    console.log(div.attr('style'));
    return div.css('display') !== 'none';
  };

  // setInterval(function(){
  //   $scope.getMenuStatus('scroll-settings');
  // }, 1000);

  $scope.toggleCollapsible = function(collapsedDivId, s1, s2){
    var div = $('#' + collapsedDivId);
    var div_mark = $('#' + collapsedDivId + '-mark');

    div_mark.toggleClass(s1);
    div_mark.toggleClass(s2);

    $(div).slideToggle({
      easing: 'easeOutQuint',
      duration: 600
    });
  };

  $scope.authByPass = function(){
    client.login({
      username: $scope.register.link,
      password: $scope.register.password
    })
    .then(function(){
      client.get()
      .then(function(user){
        $scope.user = user;
      });
    });
  };

  $scope.toggleLocalAuthBox = function (e) {
    var elm = angular.element(e.target.parentNode.parentNode),
        infoBox = elm.find('.info:first'),
        localAuthBox = elm.find('.info.local');
    infoBox.slideToggle(1000);
    localAuthBox.slideToggle(1000);
  };

  $scope.showUserBox = function (e) {
    e.preventDefault();
    $('#user-box').fadeIn(300);
  };

  $scope.closeUserBox = function (e) {
    if (e){
      e.preventDefault();
      $('#user-box').fadeOut(300);
      $('#auth-box').fadeOut(300);
    } else {
      // $('#user-box').fadeOut(0);
      $('#user-box').fadeOut(0);
    }
  };

  var tw = angular.element('.top_worm');

  var setWorm = function(speed, immediate) {
    speed = speed || 0;

    if ($scope.user.settings.interface.show_top_menu) {
      if (immediate){
        $('#toppage').css({height: '38px'});
        // $('#toppage').css({height: '38px', marginBottom: '38px'});
        // $('#view').css({'margin-top': '0px'});
        tw.css({top:'32px'});
      } else {
        // $('#toppage').animate({height: '38px', marginBottom: '0px'}, speed, 'easeOutCubic');
        // $('#view').animate({'margin-top': '0px'}, speed, 'easeOutCubic');
        tw.animate({top: '32px'}, speed, 'easeOutCubic');
      }
    } else {
      if (immediate){
        $('#toppage').css({height: '0px', marginBottom: '38px'});
        setTimeout(function(){
          // $('#view').css({'marginTop': '38px'});
        }, 0)
        tw.css({top:'0px'});
      } else {
        // $('#toppage').animate({height: '0px', marginBottom: '38px'}, speed, 'easeOutCubic');
        // $('#view').animate({'marginTop': '38px'}, speed, 'easeOutCubic');
        tw.animate({top: '0px'}, speed, 'easeOutCubic');
      }
    }
  };

  tw.click(function () {
    console.log('clicked');
    $scope.user.settings.interface.show_top_menu = !$scope.user.settings.interface.show_top_menu;
    $scope.$apply();
  });

  $scope.register.do = function () {
    $http.post('/me/register', {
      interests: $scope.register.interests.split(/[\s,]+/),
      link:      $scope.register.link,
      name:      $scope.register.name,
      surname:   $scope.register.surname,
      password:  $scope.register.password
    })
    .success(function (data, status, headers, config) {
      if (!data.error) {
        if ($scope.uploader.queue[0])
          $scope.uploader.queue[0].upload();

        client.get()
        .then(function(user){
          for (var i in user)
            if (user.hasOwnProperty(i))
              $scope.user[i] = user[i];
          $('#close-auth-box').click();
        });
      } else
        console.log(data);
    });
  };

  // loadSettings();

  // $scope.getProfile();

  $scope.get_bookmarks = function (){
    my.bookmarks_get()
    .then(function (bookmarks) {
      $window.alert(bookmarks.join('\n'));
    });
  };

  $scope.logout = function () {
    client.logout()
    .then(function(){
      client.get()
      .then(function(user){
        $scope.user = user;
      });
    });
  };
}]);
