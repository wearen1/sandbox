var runexto = angular.module('runexto', [
  'ui.router', 'ui.utils', 'ngSanitize', 'ngAnimate', 'ngStorage', 'angularFileUpload'
])
.factory('Configuration', ['$localStorage', function ($localStorage) {

  var storage = $localStorage.$default({
    settings: {
      query:  '',
      menu:   false,
      from:   'groups',
      theme:  8,
      search: {
        sources:  {
          all:  true,
          wiki: true,
          vk:   true,
          fb:   true,
          tw:   true
        },
        entities: 1
      },
      errors: {
        fb: false,
        vk: false,
        tw: false
      }
    }
  });

  return storage.settings;
}])
.factory('MyService', ['$http', '$q', function ($http, $q) {
  return {
    me:              function () {
      var d = $q.defer();
      $http.get('/me')
      .success(function (data, status, headers, config) {
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        console.log('data');
      });
      return d.promise;
    },
    settings:        (function () {
      return {
        load: function () {
          return $http.get('/me/settings');
        },
        save: function (data) {
          return $http.post('/me/settings', data);
        }
      }
    }()),
    logout:          function () {
      return $http.get('/me/logout');
    },
    bookmark_add:    function (url) {
      $http.post('/me/bookmark/' + encodeURIComponent(url));
    },
    bookmark_delete: function (url) {
      $http.delete('/me/bookmark/' + encodeURIComponent(url));
    },
    bookmarks_get:   function () {
      var d = $q.defer();
      $http.get('/me/bookmark/list')
      .success(function (data, status, headers, config) {
        d.resolve(data);
      });
      return d.promise;
    }
  };
}])
.factory('SearchAPIService', ['$http', '$q', function ($http, $q) {
  return {
    joinGroup:      function (preview) {
      var d = $q.defer();
      $http({method: 'POST', url: '/api/search/join', data: {post: preview.post.id, group: preview.post.from_id}})
      .success(function (data, status, headers, config) {
        console.log(data);
        d.resolve(data);
      });
      return d.promise;
    },
    addRepost:      function (preview) {
      var d = $q.defer();
      $http({method: 'POST', url: '/api/search/repost', data: {post: preview.post.id, group: preview.post.from_id}})
      .success(function (data, status, headers, config) {
        console.log(data);
        d.resolve(data);
      });
      return d.promise;
    },
    addComment:     function (preview, msg) {
      var d = $q.defer();
      $http({
        method: 'POST',
        url:    '/api/search/comment',
        data:   {post: preview.post.id, group: preview.post.from_id, message: msg}
      })
      .success(function (data, status, headers, config) {
        d.resolve(data);
      });
      return d.promise;
    },
    addLike:        function (preview) {
      console.log(preview);

      var d = $q.defer();
      $http({method: 'POST', url: '/api/search/like', data: {post: preview.post.id, group: preview.post.from_id}})
      .success(function (data, status, headers, config) {
        console.log(data);
        d.resolve(data);
      });
      return d.promise;
    },
    getPreview:     function (post) {
      var d = $q.defer();
      $http({
        method: 'POST',
        url:    '/api/search/preview',
        data:   {post: post.post.id, group: post.group.id, source: post.group.source}
      })
      .success(function (data, status, headers, config) {
        console.log(data);
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        d.reject(data);
      });
      return d.promise;
    },
    getWikiPreview: function (query) {
      // console.log(query);
      var d = $q.defer();
      $http({method: 'POST', url: '/api/search/preview', data: {source: 2, query: query}})
      .success(function (data, status, headers, config) {
        // console.log('wikipedia article');
        // console.log(data);
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        d.reject(data);
      });
      return d.promise;
    },
    getGroups:      function (query) {
      var d = $q.defer();
      $http({method: 'POST', url: '/api/search/groups', data: {query: query}})
      .success(function (data, status, headers, config) {
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        d.reject(data);
      });
      return d.promise;
    },
    getPosts:       function (query, from) {
      var d = $q.defer();
      $http({method: 'POST', url: '/api/search/posts', data: {query: query, from: from}})
      .success(function (data, status, headers, config) {
        console.log(data);
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        d.reject(data);
      });
      return d.promise;
    }
  }
}])

.directive('authModal', [function () {
  return {
    restrict: 'A',
    link:     function (scope, element) {
      scope.openWindow = function (url) {
        var wnd = window.open(url, 'Authorize', 'width=800,height=600');
        window.addEventListener("message", function (event) {
          if (event.origin !== "http://deathstar.local:4000" && event.origin !== "http://runexto.com")
            return;
          scope.getProfile();
        }, false);
      };
    }
  };
}])
.directive('bookmark', [function () {
  return {
    restrict: 'E',
    compile:  function compile(tElement, tAttrs, transclude) {
      tElement.append($('<a>').attr({
        href: ''
      })
      .append($('<div>').addClass('bookmark')));

      return function postLink(scope, iElement, iAttrs, controller) {
        scope.my.bookmarks_get()
        .then(function (bookmarks) {
          if (bookmarks.indexOf(iAttrs.link) !== -1) {
            var div_bm = angular.element(iElement.children()[0].firstChild);
            div_bm.removeClass('bookmark');
            div_bm.addClass('check');
          }
        });

        iElement.click(function (e) {
          var div_bm = angular.element(iElement.children()[0].firstChild);
          if (div_bm.hasClass('check'))
            scope.my.bookmark_delete(iAttrs.link);
          else
            scope.my.bookmark_add(iAttrs.link);

          div_bm.toggleClass('bookmark');
          div_bm.toggleClass('check');
        });
      }
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
.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('search', {
    url:         '/search',
    templateUrl: 'runexto/search/search.html',
    controller:  'SearchCtrl'
  })
  .state('index', {
    url:         '/',
    templateUrl: 'runexto/index/index.html',
    controller:  'IndexCtrl'
  })
  .state('hi', {
    url:         '/hi',
    templateUrl: 'http://hi.runexto.com/temps/body.html',
    controller:  'HiCtrl'
  });
  $locationProvider.html5Mode(true);
}])
.controller('AuthCtrl', ['Configuration', '$localStorage', 'MyService', '$window', '$scope', '$rootScope', '$http', 'FileUploader', '$state', function (conf, $localStorage, my, $window, $scope, $rootScope, $http, FileUploader, $state) {
  $scope.register = {};

  $scope.conf = conf;

  var uploader = new FileUploader({
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

  $scope.uploader = uploader;


  $scope.toggleFullScreen = function () {
    console.log('toggling fs');
    if (screenfull.enabled) {
      screenfull.toggle();

      // setInterval(function(){
      // document.body.style.display = 'none';
      // document.body.style.display = 'block';
      // }, 100);

      angular.element('body').onscroll = function () {
        // console.log('scroll evt');
        // angular.element('body').addClass('dummyclass').delay(0).removeClass('dummyclass');
        // document.body.style.zoom = '1.00001';
        // console.log(document.body.style.zoom);

        // document.body.style.zoom = '1.00002';
        // console.log(document.body.style.zoom);
      }
      // document.body.style.webkitTransform = 'translateZ(10)';

      // $('*').css('outline','1px solid transparent');
      // $('*').css('outline','0px solid transparent');

      //  	document.body.style.display='inline-block';
      // document.body.offsetHeight; // no need to store this anywhere, the reference is enough
      // document.body.style.display='';

      // $(document.body).trigger('resize');
      // window.getComputedStyle();
      // document.body.style.display='none';
      // document.body.style.opacity = 100 - Math.random() * 20; // no need to store this anywhere, the reference is enough

      // document.body.style.display='';
      // }
    }
  };

  $scope.toggleLocalAuthBox = function (e) {
    var elm = angular.element(e.target.parentNode.parentNode),
        infoBox = elm.find('.info:first'),
        localAuthBox = elm.find('.info.local');
    //console.log(infoBox);
    infoBox.slideToggle(1000);
    localAuthBox.slideToggle(1000);
    //elm.slideUp();
    //console.log(e.target);
    //console.log(e.target.slideUp());
  };


  $scope.showUserBox = function (e) {
    e.preventDefault();
    $('#user-box').fadeIn(300);
  };

  $scope.closeUserBox = function (e) {
    e.preventDefault();
    $('#user-box').fadeOut(300);
  };


  var setTheme = function (id) {
    console.log('setting theme with id:' + id);

    conf.theme = id;
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

    // swal("Good job!", "Selected theme now is active.", "success");
    // setTimeout( function () {$('.wrap').attr('class', 'wrap theme_' + id);}, 100);

  };

  $scope.setTheme = setTheme;


  setTheme(conf.theme);

  console.log(conf);
  $scope.menu = conf.interface.show_top_menu;

  var tw = $('.top_worm');

  function updateWorm(speed) {
    if (conf.interface.show_top_menu) {
      tw.animate({top: '36px'}, speed, "linear");
      $('header').animate({marginTop: '0px'}, speed, "linear");
      $('#view').animate({paddingTop: '25px'}, speed, "linear");
      if ($state.current.name == 'index')
        $('footer').fadeIn(speed);
      tw.removeClass('collapsed');
    } else {
      tw.animate({top: '0px'}, speed, "linear");
      $('header').animate({marginTop: '-42px'}, speed, "linear");
      $('#view').animate({paddingTop: '67px'}, speed, "linear");
      $('footer').fadeOut(speed);
      tw.addClass('collapsed');
    }
    conf.interface.show_top_menu = !conf.interface.show_top_menu;
  };

  $scope.$watch('menu', function () {
    updateWorm(500);
  });


  updateWorm(0);

  tw.click(function () {
    $scope.menu = !$scope.menu;
    $scope.$apply();
    console.log(conf);
    // updateWorm(500);
  });

  $scope.register.do = function () {
    $http.post('/me/register', {
      interests: $scope.register.interests.split(/[\s,]+/),
      link:      $scope.register.link,
      name:      $scope.register.name,
      surname:   $scope.register.surname
    })
    .success(function (data, status, headers, config) {
      if (!data.error) {
        $scope.uploader.queue[0].upload();
        $('#close-auth-box').click();
        $scope.getProfile();
      } else
        console.log(data);
    });
  };

  $scope.getProfile = function () {
    my.me()
    .then(function (data) {
      console.log(data);
      conf.errors = {
        fb: false,
        tw: false,
        vk: false
      };
      $scope.user = data;
    });
  };

  $scope.getProfile();

  $scope.get_bookmarks = function () {
    my.bookmarks_get()
    .then(function (bookmarks) {
      $window.alert(bookmarks.join('\n'));
    });
  };

  $scope.logout = function () {
    my.logout()
    .success(function (data) {
      if (data.status == 'ok') {
        $scope.user = null;
        $scope.getProfile();
      }
    });
  };

}])
.controller('IndexCtrl', ['Configuration', '$scope', '$state', '$rootScope', '$location', '$window', 'MyService', function (conf, $scope, $state, $rootScope, $location, $window, my) {
  if (!conf.interface.show_top_menu)
    $('footer').fadeIn(0);

  my.settings.load()
  .then(function (data) {
    console.log(data);
  });

  $('body').css({overflow: 'hidden'});
  if (!conf.interface.show_top_menu)
    $('#view').css({paddingTop: '25px'});
  else
    $('#view').css({paddingTop: '67px'});

  $('#show-settings').css({marginTop: '0'});
  conf.query = '';
  $scope.conf = conf;

  $scope.ExecQuerySearch = function (evt) {
    if (evt)
      if (evt['which'] != 13 && evt['which'] != 32)
        return;
    if (conf.query.length)
      $state.go('search');
  };
}])
.controller('SearchCtrl', ['Configuration', '$sce', '$window', '$scope', '$rootScope', '$http', '$localStorage', 'SearchAPIService', 'MyService', function (conf, $sce, $window, $scope, $rootScope, $http, $localStorage, sapi, my) {
  // $('footer').animate({opacity: 0 }, 500, "linear");

  $('footer').fadeOut(500);
  $('#show-settings').css('marginTop', '100px');

  $(window).on('scroll', function () {

  });

  //$('#show-settings').css('position', 'absolute');

  $scope.toggleBlock = function (evt) {
    // $(evt.target.parentNode).fadeOut(1000);
    $(evt.target.parentNode).animate({opacity: 0, duration: 1000, height: 0}, function () {
      this.css({display: none});
    });
    // $(evt.target.parentNode).toggle(1000, 'easeInOutCubic');
  };

  $scope.conf = conf;

  if (!conf.interface.show_top_menu)
    $('#view').css({paddingTop: '25px'});
  else
    $('#view').css({paddingTop: '67px'});

  //$('#show-settings').css({marginTop: '30px'});
  $('body').css({overflow: 'auto'});

  $scope.query = $rootScope.query;
  $scope.data = {};

  angular.element('#search').focus();

  $scope.tweetScroll = function () {
    $('.tweet_results').removeAttr('style');

    // console.log('tweet scroll');
    // $("#tweet-area").mCustomScrollbar({scrollInertia:450});
  };

  $scope.get_bookmarks = function () {
    my.bookmarks_get()
    .then(function (bookmarks) {
      $window.alert(bookmarks.join('\n'));
    });
  };

  $scope.add_bookmark = function (url, $event) {
    my.bookmark_add(url);
    var elm = angular.element($event.target).children()[0];
    elm.toggleClass('bookmark');
    elm.toggleClass('check');
    elm.toggleClass('check');
    elm.toggleClass('bookmark');
  };

  $scope.getProfile = function () {
    my.me()
    .then(function (data) {
      $scope.me = data;
    });
  };

  $scope.getProfile();


  $scope.my = my;

  $scope.searchHash = false;

  // $scope.$watch(angular.element('.one_tweet'), function(element){
  // 	if (element.length == 2){
  // 		var h = element[0].clientHeight + element[1]?element[1].clientHeight:element[0].clientHeight - 27;
  // 		console.log(h);
  // 		angular.element('#tweet-area').css({height: h});
  // 	}
  // });

  $scope.twUp = function () {
    $scope.data.group.twitter = $scope.data.groups.twitter[$scope.data.groups.twitter.indexOf($scope.data.group.twitter) - 1];
  };

  $scope.twDown = function () {
    $scope.data.group.twitter = $scope.data.groups.twitter[$scope.data.groups.twitter.indexOf($scope.data.group.twitter) + 1];
  };

  $scope.vkUp = function () {
    $scope.data.group.vkontakte = $scope.data.groups.vkontakte[$scope.data.groups.vkontakte.indexOf($scope.data.group.vkontakte) - 1];
  };

  $scope.vkDown = function () {
    $scope.data.group.vkontakte = $scope.data.groups.vkontakte[$scope.data.groups.vkontakte.indexOf($scope.data.group.vkontakte) + 1];
  };

  $scope.fbUp = function () {
    $scope.data.group.facebook = $scope.data.groups.facebook[$scope.data.groups.facebook.indexOf($scope.data.group.facebook) - 1];
  };

  $scope.fbDown = function () {
    $scope.data.group.facebook = $scope.data.groups.facebook[$scope.data.groups.facebook.indexOf($scope.data.group.facebook) + 1];
  };

  $scope.addLike = function () {
    sapi.addLike($scope.data.vkPreview);
  };

  $scope.joinGroup = function () {
    sapi.joinGroup($scope.data.vkPreview);
  };

  $scope.addComment = function (evt) {
    if (evt) {
      if (evt['which'] == 13 && evt.ctrlKey == true)
        sapi.addComment($scope.data.vkPreview, $scope.comment_message)
        .then(function () {
          $scope.comment_message = '';

          var tmpPost = {post: $scope.data.vkPreview.post.id, group: $scope.data.vkPreview.post.from_id, source: 0};

          sapi.getPreview(tmpPost)
          .then(function (preview) {
            switch (preview.source) {
              case 0:
                console.log('preview date ', preview.post[0].date);

                var previewData = {
                  date:     preview.post[0].date,
                  reposts:  preview.post[0].reposts.count,
                  likes:    preview.post[0].likes.count,
                  post:     preview.post[0],
                  comments: preview.comments,
                  text:     preview.post[0].text,
                  group:    {
                    id:            preview.group.id,
                    name:          preview.wall[0].name,
                    activity:      preview.wall[0].activity,
                    photo:         preview.wall[0].photo_100,
                    members_count: preview.wall[0].members_count,
                    posts_count:   preview.group.count,
                    albums_count:  preview.wall[0]['counters']['albums'] || 0,
                    videos_count:  preview.wall[0]['counters']['videos'] || 0
                  },
                  href:     preview.href
                };

                console.log(previewData);

                previewData.comments.items.forEach(function (i) {
                  // i.date = new Date(i.date * 1000);

                  i.author = previewData.comments.profiles.filter(function (j) {
                    return (i.from_id == j.id);
                  })[0];
                });

                // console.log(previewData);

                $scope.data.vkPreview = previewData;

                openVKmodal();
                break;
              case 1:
                $scope.data.fbPreview = preview;
                openFBmodal();
                break;
            }
          });
        });
      else
        return;
    } else
      sapi.addComment($scope.data.vkPreview, $scope.comment_message)
      .then(function () {
        $scope.comment_message = '';

        var tmpPost = {
          post:  {id: $scope.data.vkPreview.post.id},
          group: {id: Math.abs($scope.data.vkPreview.post.from_id), source: 0}
        };

        console.log(tmpPost);

        sapi.getPreview(tmpPost)
        .then(function (preview) {
          console.log(preview);

          switch (preview.source) {
            case 0:

              var previewData = {
                date:     preview.post[0].date,
                reposts:  preview.post[0].reposts.count,
                likes:    preview.post[0].likes.count,
                post:     preview.post[0],
                comments: preview.comments,
                text:     preview.post[0].text,
                group:    {
                  id:            preview.group.id,
                  name:          preview.wall[0].name,
                  activity:      preview.wall[0].activity,
                  photo:         preview.wall[0].photo_100,
                  members_count: preview.wall[0].members_count,
                  posts_count:   preview.group.count,
                  albums_count:  preview.wall[0]['counters']['albums'] || 0,
                  videos_count:  preview.wall[0]['counters']['videos'] || 0
                },
                href:     preview.href
              };

              previewData.comments.items.forEach(function (i) {
                // i.date = new Date(i.date * 1000);

                i.author = previewData.comments.profiles.filter(function (j) {
                  return (i.from_id == j.id);
                })[0];
              });

              // console.log(previewData);

              $scope.data.vkPreview = previewData;

              openVKmodal();
              break;
            case 1:
              $scope.data.fbPreview = preview;
              openFBmodal();
              break;
          }
        });
      });
  }

  $scope.addRepost = function () {
    sapi.addRepost($scope.data.vkPreview);
  }

  $scope.show_wiki_preview = function (evt) {
    // console.log(evt);
    if (evt.toElement.nodeName == 'A')
      return;
    console.log('loading wiki preview');
    sapi.getWikiPreview(conf.query)
    .then(function (data) {
      $scope.data.wikiPreview = {
        data:  $sce.trustAsHtml(data.data),
        links: data.links
      };

      $("#box-wiki-content").mCustomScrollbar({scrollInertia: 450});
      $("#link-box").mCustomScrollbar({scrollInertia: 450});

      openWIKImodal();
    });
  };

  $scope.applyScroll = function () {
    // $("#link-box").mCustomScrollbar({scrollInertia:450});
  };


  $scope.getNiceDate = function (date) {
    // console.log(date);
    return (new Date(date)).toLocaleTimeString();
  };

  $scope.show_preview = function (index) {
    sapi.getPreview($scope.data.posts[index])
    .then(function (preview) {
      switch (preview.source) {
        case 0:
          console.log('preview date ', preview.post[0].date);

          var previewData = {
            date:     preview.post[0].date,
            reposts:  preview.post[0].reposts.count,
            likes:    preview.post[0].likes.count,
            post:     preview.post[0],
            comments: preview.comments,
            text:     preview.post[0].text,
            group:    {
              id:            preview.group.id,
              name:          preview.wall[0].name,
              activity:      preview.wall[0].activity,
              photo:         preview.wall[0].photo_100,
              members_count: preview.wall[0].members_count,
              posts_count:   preview.group.count,
              albums_count:  preview.wall[0]['counters']['albums'] || 0,
              videos_count:  preview.wall[0]['counters']['videos'] || 0
            },
            href:     preview.href
          };

          previewData.comments.items.forEach(function (i) {
            // i.date = new Date(i.date * 1000);

            i.author = previewData.comments.profiles.filter(function (j) {
              return (i.from_id == j.id);
            })[0];
          });

          // console.log(previewData);

          $scope.data.vkPreview = previewData;

          openVKmodal();
          break;
        case 1:
          $scope.data.fbPreview = preview;
          openFBmodal();
          break;
      }
      // console.log(preview);
    });
    // alert(index);
  }

  // var sInt = null;

  $scope.ExecQuerySearch = function (evt) {
    // if (sInt)
    // clearTimeout(sInt);
    // console.log(evt);
    if (evt && evt['which']) {
      if (evt['which'] == 35) {
        conf.searchHash = !conf.searchHash;
        evt.preventDefault();
      }
      if (evt && evt['which'] != 13)
        return;
      // $scope.ExecQuerySearch();
    }

    var query = (conf.searchHash ? '#' : '') + conf.query;

    // var sInt = setTimeout(function(){
    // $location.search($scope.query);
    console.log(conf);

    sapi.getGroups(query)
    .then(function (data) {
      // console.log({data: data});
      $scope.data.groups = {};
      $scope.data.group = {};

      // console.log(data);

      if (data.facebook) {

        // console.log(conf);

        if (data.facebook.error)
          conf.errors.fb = true;

        // $window.alert('Need to refresh facebook token, redirecting...');

        $scope.data.groups.facebook = data.facebook;
        $scope.data.group.facebook = $scope.data.groups.facebook[0];
        // console.log($scope.data);
      }
      if (data.wiki) {
        var unwrap = function (data) {
          var a = document.createElement('div');
          a.innerHTML = data;
          a.innerHTML = a.innerText;
          return a.innerHTML;
        };

        data.wiki.Description.$t = unwrap(data.wiki.Description.$t);
        data.wiki.Text.$t = unwrap(data.wiki.Text.$t);
        if (data.wiki.Description.$t.length > 100) {
          // data.wiki.Description.$t = $sce.trustAsHtml(data.wiki.Description.$t.split('.')[0].trim());
        }
        else
          data.wiki.Description.$t = $sce.trustAsHtml(data.wiki.Description.$t.trim());
        $scope.data.wiki = data.wiki;
        $scope.data.wiki.Url.$t = unwrap($scope.data.wiki.Url.$t);
      }
      if (data.vkontakte) {
        if (data.vkontakte.error) {
          conf.errors.vk = true;
          // $window.alert('Need to refresh token, redirecting...');
        }
        $scope.data.groups.vkontakte = data.vkontakte
        $scope.data.group.vkontakte = data.vkontakte[0];
      }
      if (data.twitter) {
        $scope.data.groups.twitter = data.twitter;
        $scope.data.group.twitter = data.twitter[0];
      }
      if (data.tweets) {
        $scope.data.statuses = data.tweets.statuses;

        // if (data.tweets.statuses.length){
        // 	if (angular.element('.one_tweet').length >= 2){
        //     	var height = angular.element('.one_tweet')[0].clientHeight + angular.element('.one_tweet')[1].clientHeight - 27;
        //      angular.element('#tweet-area').css('height', height + 'px');
        //    } else
        //    	angular.element('#tweet-area').css('height', 199 - 27 + 'px');
        // }
      }

      // console.log('scope data twutter :', $scope.data);
    })
    .catch(function (err) {
      $scope.data.wiki = null;
    });

    sapi.getPosts(query, conf.search.sources.posts_of || 'groups')
    .then(function (data) {
      $scope.data.posts = data.vkontakte;

      // angular.forEach($scope.data.posts, function(p){
      // 	p.post.date = p.post.date.toLocaleDateString();
      // });

    });
    // }, 2000);
  };

  $scope.ExecQuerySearch();

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
.directive('checkbox', ['Configuration', function (conf) {
  return {
    restrict: 'E',
    scope:    {
      'settings': '='
    },
    compile:  function (elem, attrs) {
      elem.append(
      $('<div>').addClass('fl_l option_item non-selectable')
      .append(
      $('<div>').addClass('fl_l name_item').text(attrs.title)
      )
      .append(
      $('<div>').addClass('fl_r point')
      .append(
      $('<div>').addClass(attrs.name + '-check').addClass((typeof(attrs.checked) !== 'undefined') ? 'checked' : '')
      )
      )
      );

      return function (scope, iElement, iAttrs) {
        iElement.find('[class~=' + attrs.name + '-check]').toggleClass('checked', conf.search.sources[attrs.name]);
        iElement.click(function (event) {
          conf.search.sources[attrs.name] = !conf.search.sources[attrs.name];
          iElement.find('[class~=' + attrs.name + '-check]').toggleClass('checked', conf.search.sources[attrs.name]);
          scope.$parent.$apply();
        });
      };
    }
  };
}]);
