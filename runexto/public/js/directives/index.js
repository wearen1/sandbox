runexto
.directive('authModal', ['ClientService', function (client) {
  return {
    restrict: 'A',
    link:     function (scope, element) {
      scope.openWindow = function (url) {
        var wnd = window.open(url, 'Authorize', 'width=800,height=600');
        window.addEventListener("message", function (event) {
          if (event.origin === "http://deathstar.local:4000" ||
            event.origin === "https://runexto.com" ||
            event.origin === "http://runexto.com"){

            client.get()
            .then(function(user){
              console.log('got user', user);
              scope.closeUserBox();
              for (i in user)
                if (user.hasOwnProperty(i))
                  scope.user[i] = user[i];
              // scope.user = user;
            });
          }
        }, false);
      };
    }
  };
}])
.directive('bookmark', ['ClientService', function (client) {
  return {
    restrict: 'E',
    compile:  function compile(tElement, tAttrs, transclude) {
      tElement.append($('<a>').attr({
        href: ''
      })
      .append($('<div>').addClass('bookmark')));

      return function postLink(scope, iElement, iAttrs, controller) {
        if (scope.data.bookmarks.length && scope.data.bookmarks.indexOf(iAttrs.link) !== -1) {
          var div_bm = angular.element(iElement.children()[0].firstChild);
          div_bm.removeClass('bookmark');
          div_bm.addClass('check');
        }

        iElement.click(function (e) {
          var div_bm = angular.element(iElement.children()[0].firstChild);
          if (div_bm.hasClass('check'))
            client.bookmarks.del(iAttrs.link);
          else
            client.bookmarks.add(iAttrs.link);

          div_bm.toggleClass('bookmark');
          div_bm.toggleClass('check');
        });
      };
    },
    link:     function postLink(scope, iElement, iAttrs) {

    }
  };
}])
.directive('ngThumb', ['$window', function ($window) {
  var helper = {
    support: !!($window.FileReader && $window.CanvasRenderingContext2D),
    isFile:  function (item) {
      return angular.isObject(item) && item instanceof $window.File;
    },
    isImage: function (file) {
      var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|'.indexOf(type) !== -1;
    }
  };

  return {
    restrict: 'A',
    template: '<canvas/>',
    link:     function (scope, element, attributes) {
      if (!helper.support) return;

      var params = scope.$eval(attributes.ngThumb);

      if (!helper.isFile(params.file)) return;
      if (!helper.isImage(params.file)) return;

      var canvas = element.find('canvas');
      var reader = new FileReader();

      reader.onload = onLoadFile;
      reader.readAsDataURL(params.file);

      function onLoadFile(event) {
        var img = new Image();
        img.onload = onLoadImage;
        img.src = event.target.result;
      }

      function onLoadImage() {
        var width = params.width || this.width / this.height * params.height;
        var height = params.height || this.height / this.width * params.width;
        canvas.attr({width: width, height: height});
        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
      }
    }
  };
}])
.directive('tweetRepeat', function () {
  return function (scope, element, attrs) {
    if (scope.$first) {
      console.log(element);
      // iteration is complete, do whatever post-processing
      // is necessary
      element.parent().mCustomScrollbar({scrollInertia: 450});

      // element.parent().css('border', '1px solid black');
    }
  };
})
.directive('checkbox', ['$translate', function($translate) {
  return {
    restrict: 'E',
    scope: true,
    transclude: true,
    compile:  function (elem, attrs) {

      elem.append(
                  $('<div>').addClass('fl_l option_item non-selectable')
                      .append(
                      $('<div>').addClass('fl_l name_item').attr('translate', '').text(attrs.title)
                  )
                      .append(
                      $('<div>').addClass('fl_r point')
                          .append(
                          $('<div>').addClass(attrs.name + '-check').addClass((typeof(attrs.checked) !== 'undefined') ? 'checked' : '')
                      )
                  )
              );


      return function(scope, iElement, iAttrs) {
        var val;
        if (typeof scope.user.settings.search.sources[attrs.name] !== 'undefined')
          val = scope.user.settings.search.sources[attrs.name];
        else
          val = scope.user.settings.search.types[attrs.name];

        iElement.find('[class~=' + attrs.name + '-check]').toggleClass('checked', val);

        scope.$watch(function(){
          return JSON.stringify(scope.user.session);
        }, function(){
          console.log(':directives/checkbox ~scopeConfChanged');
          console.log(scope.user.session);

          if (['groups', 'events'].indexOf(attrs.name) !== -1 && (scope.user.session.vk === false && scope.user.session.fb === false && scope.user.session.tw === false) ||
            attrs.name == 'tweets' && scope.user.session.tw === false ||
            attrs.name == 'fb' && scope.user.session.fb === false
          ) {
            iElement.find('[class~=' + attrs.name + '-check]').addClass('disabled');
            iElement.attr('title', 'Вы не авторизованы');
          }
          else {
            iElement.find('[class~=' + attrs.name + '-check]').removeClass('disabled');
            iElement.attr('title', '');
          }
        });

        iElement.click(function (event) {
          if (iElement.find('[class~=' + attrs.name + '-check]').hasClass('disabled'))
            return;

          var val;
          if (typeof scope.user.settings.search.sources[attrs.name] !== 'undefined'){
            scope.user.settings.search.sources[attrs.name] = !scope.user.settings.search.sources[attrs.name];
            val = scope.user.settings.search.sources[attrs.name];
          }
          else {
            scope.user.settings.search.types[attrs.name] = !scope.user.settings.search.types[attrs.name];
            val = scope.user.settings.search.types[attrs.name];
          }

          iElement.find('[class~=' + attrs.name + '-check]').toggleClass('checked', val);
          scope.$apply();
        });
      };
    }
  };
}]);
