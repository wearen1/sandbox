runexto
.controller('SearchCtrl', ['ClientService', '$state', '$sce', '$window', '$scope', '$rootScope', '$http', '$localStorage', 'SearchAPIService',  function (client, $state, $sce, $window, $scope, $rootScope, $http, $localStorage, sapi) {
  // console.log($scope.user);
  console.log($scope.$parent);
  $scope.query = $rootScope.query || '';

  console.log($scope.query);

  if (!$scope.query.length)
    $state.go('index');

  $scope.searchHash = false;

  var doPreload = (function() {
    smoothScroll.init({
      speed:          700,
      easing:         'easeInOutCubic',
      offset:         0,
      updateURL:      false,
      callbackBefore: function (toggle, anchor) {
      },
      callbackAfter:  function (toggle, anchor) {
      }
    }
    );

    // $('body').css({overflow: 'overlay'});
    $('#view').mCustomScrollbar({
      alwaysShowScrollbar: 2,
      scrollInertia:450,
      callbacks: {
        onTotalScroll: function(){
          console.log('total');
          $scope.getNextPage();
        },
        whileScrolling: function(e){
          if (this.mcs.top <= -100){
            if (!up_slided){
              $('#up').show("slide", {direction: "up", easing: 'easeOutCubic'}, 450);
              up_slided = !up_slided;
            }
            $('#search_options').css({
              opacity: 0.7
            });
          } else {
            if (up_slided){
              $('#up').hide("slide", {direction: "up", easing: 'easeOutCubic'}, 450);
              up_slided = !up_slided;
            }

            $('#search_options').css({
              opacity: 1
            });
          }
        }
      }});

    //hide footer
    angular.element('footer').fadeOut(500);
    //move settings button lower
    // angular.element('#show-settings').css('marginTop', '110px');
    //load sticky

    //angular.element("#fixed-floating").sticky({ topSpacing: 0 });

    //load scrollbars
    angular.element("#box-vk-content").mCustomScrollbar({ scrollInertia:450 });
    angular.element("#box-fb-content").mCustomScrollbar({ scrollInertia:450 });
  }());

  $scope.toggleBlock = function (evt) {
    $(evt.target.parentNode).animate({opacity: 0, duration: 1000, height: 0}, function () {
      this.css({display: none});
    });
  };

  // if (!$scope.user.settings.interface.show_top_menu)
  //   $('#view').css({paddingTop: '25px'});
  // else
  //   $('#view').css({paddingTop: '67px'});

  $scope.data = {};

  angular.element('#search').focus();

  $scope.tweetScroll = function () {
    $('.tweet_results').removeAttr('style');
  };

  // var loadSettings = function(){
  //   my.settings.load()
  //   .then(function(settings) {
  //     $scope.conf = conf = settings;
  //
  //     return;
  //   })
  //   .catch(function(err){
  //     setTheme(conf.theme);
  //     console.log('err is', err);
  //     return;
  //   });
  // };

  // var getProfile = $scope.getProfile = function () {
  //   console.log('called');
  //   my.me()
  //   .then(function (data) {
  //     $scope.user = data;
  //     user.auth = data.session;
  //     $scope.conf = conf;
  //
  //     loadSettings();
  //   })
  //   .catch(function(e){
  //     loadSettings();
  //   });
  // };

  // getProfile();

  $scope.vkEventUp = function(){
    $scope.data.vk_event = $scope.data.vk_events[$scope.data.vk_events.indexOf($scope.data.vk_event) - 1];
  };

  $scope.vkEventDown = function(){
    $scope.data.vk_event = $scope.data.vk_events[$scope.data.vk_events.indexOf($scope.data.vk_event) + 1];
  };

  $scope.fbEventUp = function(){
    $scope.data.fb_event = $scope.data.fb_events[$scope.data.fb_events.indexOf($scope.data.fb_event) - 1];
  };

  $scope.fbEventDown = function(){
    $scope.data.fb_event = $scope.data.fb_events[$scope.data.fb_events.indexOf($scope.data.fb_event) + 1];
  };

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

  $scope.addVKLike = function () {
    sapi.addLike($scope.data.vkPreview);
  };

  $scope.joinVKGroup = function () {
    sapi.joinGroup($scope.data.vkPreview);
  };

  $scope.addVKComment = function (evt) {
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

                var previewData = {
                  date:     preview.post.date,
                  reposts:  preview.post.reposts.count,
                  likes:    preview.post.likes.count,
                  post:     preview.post,
                  comments: preview.comments,
                  text:     preview.post.text,
                  group:    {
                    id:            preview.group.id,
                    name:          preview.wall.name,
                    activity:      preview.wall.activity,
                    photo:         preview.wall.photo_100,
                    members_count: preview.wall.members_count,
                    posts_count:   preview.group.count,
                    albums_count:  preview.wall['counters']['albums'] || 0,
                    videos_count:  preview.wall['counters']['videos'] || 0
                  },
                  href:     preview.href
                };

                previewData.comments.items.forEach(function (i) {

                  i.author = previewData.comments.profiles.filter(function (j) {
                    return (i.from_id == j.id);
                  })[0];
                });


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


        sapi.getPreview(tmpPost)
        .then(function (preview) {

          switch (preview.source) {
            case 0:

              var previewData = {
                date:     preview.post.date,
                reposts:  preview.post.reposts.count,
                likes:    preview.post.likes.count,
                post:     preview.post,
                comments: preview.comments,
                text:     preview.post.text,
                group:    {
                  id:            preview.group.id,
                  name:          preview.wall.name,
                  activity:      preview.wall.activity,
                  photo:         preview.wall.photo_100,
                  members_count: preview.wall.members_count,
                  posts_count:   preview.group.count,
                  albums_count:  preview.wall['counters']['albums'] || 0,
                  videos_count:  preview.wall['counters']['videos'] || 0
                },
                href:     preview.href
              };

              previewData.comments.items.forEach(function (i) {
                // i.date = new Date(i.date * 1000);

                i.author = previewData.comments.profiles.filter(function (j) {
                  return (i.from_id == j.id);
                })[0];
              });


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
  };

  $scope.addVKRepost = function () {
    sapi.addRepost($scope.data.vkPreview);
  };

  $scope.wikiBackgroundClick = function(e) {
    if (e.target.className === 'background') {
      $('#layout-wiki').css({
        display: 'none'
      });
      // $("html,body").css("overflow", "auto");
    }
  };

  $scope.vkBackgroundClick = function(e) {
    if (e.target.className === 'background') {
      $('#layout-vk').fadeOut(1);
      // $("html,body").css("overflow", "scroll");
    }
  };

  $scope.fbBackgroundClick = function(e) {
    if (e.target.className === 'background') {
      $('#layout-fb').fadeOut(1);
      // $("html,body").css("overflow", "scroll");
    }
  };

  $scope.show_wiki_preview = function (evt) {
    if (evt.toElement.nodeName == 'A')
      return;
    openWIKImodal();
  };

  $scope.applyScroll = function () {
    // $("#link-box").mCustomScrollbar({scrollInertia:450});
  };


  $scope.getNiceDate = function (date) {
    return (new Date(date)).toLocaleTimeString();
  };

  $scope.showPostPreview = function (index) {
    sapi.getPreview($scope.data.posts[index])
    .then(function (preview) {
      console.log('preview', preview);

      switch (preview.source) {
        case 'vk':
          var previewData = {
            date:     preview.post.date,
            reposts:  preview.post.reposts.count,
            likes:    preview.post.likes.count,
            post:     preview.post,
            comments: preview.comments,
            text:     preview.post.text,
            group:    {
              id:            preview.group.id,
              name:          preview.wall.name,
              activity:      preview.wall.activity,
              photo:         preview.wall.photo_100,
              members_count: preview.wall.members_count,
              posts_count:   preview.group.count,
              albums_count:  preview.wall['counters']['albums'] || 0,
              videos_count:  preview.wall['counters']['videos'] || 0
            },
            href:     preview.href
          };

          previewData.comments.items.forEach(function (i) {
            i.author = previewData.comments.profiles.filter(function (j) {
              return (i.from_id == j.id);
            })[0];
          });


          $scope.data.vkPreview = previewData;

          openVKmodal();
          break;
        case 'fb':
          $scope.data.fbPreview = preview;
          openFBmodal();
          break;
      }
    });
  };

  $scope.getNextPage = function(){
    var query = ($scope.searchHash ? '#' : '') + $scope.query;

    $scope.page = $scope.page || 0;
    $scope.page++;

    sapi.doSearch(query, {
      sources: $scope.user.settings.search.sources,
      types: $scope.user.settings.search.types,
      from: $scope.user.settings.search.sources.posts_of,
      page: $scope.page
    })
    .then(function (data) {
      console.log('got data:', data);

      $scope.data.posts = $scope.data.posts.concat(data.vk_posts);
    })
    .catch(function (err) {
      // $scope.data.wiki = null;
    });

  };

  $scope.ExecQuerySearch = function(evt) {
    if (evt && evt['which']) {
      if (evt['which'] == 35) {
        $scope.searchHash = !$scope.searchHash;

        evt.preventDefault();
      }
      if (evt && evt['which'] != 13)
        return;
    }


    client.bookmarks.all()
    .then(function (bookmarks) {
      $scope.data.bookmarks = bookmarks;
    });

    var query = ($scope.searchHash ? '#' : '') + $scope.query;

    sapi.doSearch(query, {
      sources: $scope.user.settings.search.sources,
      types: $scope.user.settings.search.types,
      from: $scope.user.settings.search.sources.posts_of
    })
    .then(function (data) {
      console.log('got data:', data);

      delete $scope.data.vk_groups;
      delete $scope.data.vk_group;

      delete $scope.data.vk_events;
      delete $scope.data.vk_event;

      delete $scope.data.fb_group;
      delete $scope.data.tw_group;

      delete $scope.data.fb_events;
      delete $scope.data.fb_event;

      delete $scope.data.tw_tweets;
      delete $scope.data.wiki;

      delete $scope.data.posts;

      $scope.data.groups = {};
      $scope.data.group = {};

      $scope.data.posts = ((data.vk_posts || []).concat(data.fb_posts || []));

      if (data.fb_groups) {
        // if (data.fb_groups.error)
          // conf.errors.fb = true;

        $scope.data.groups.facebook = data.fb_groups;
        $scope.data.group.facebook = $scope.data.groups.facebook[0];
      }

      if (data.vk_events){
        $scope.data.vk_events = data.vk_events;
        $scope.data.vk_event = data.vk_events[0];
      }

      if (data.fb_events){
        $scope.data.fb_events = data.fb_events;
        $scope.data.fb_event = data.fb_events[0];
      }

      if (data.wiki_articles) {
        $scope.data.wiki = data.wiki_articles;
        $scope.data.wiki.full = false;
        if ($scope.data.wiki.summary.length > 50){
          var pos;
          for (var i = pos = Math.min(200,$scope.data.wiki.summary.length - 1); i > 2; i--)
            if ($scope.data.wiki.summary[i] !== $scope.data.wiki.summary[i].toLowerCase() || $scope.data.wiki.summary[i] === 'r' &&
              ($scope.data.wiki.summary[i - 1] === ' ' || $scope.data.wiki.summary[i - 1] === '\n' || $scope.data.wiki.summary[i-1] === 'b' ) &&
              $scope.data.wiki.summary[i - 2] === '.' || $scope.data.wiki.summary[i-2] === '<'){
              pos = i;
              break;
            }

          $scope.data.wiki.short_summary = $scope.data.wiki.summary.slice(0, pos);
        }
      }

      if (data.vk_groups) {
        $scope.data.groups = $scope.data.groups || {};
        $scope.data.group = $scope.data.group || {};

        $scope.data.groups.vkontakte = data.vk_groups;
        $scope.data.group.vkontakte = data.vk_groups[0];
      }

      if (data.tw_users) {
        $scope.data.groups.twitter = data.tw_users;
        $scope.data.group.twitter = data.tw_users[0];
      }
      if (data.tw_tweets) {
        $scope.data.statuses = data.tw_tweets.statuses;
        console.log($scope.data.statuses);
      }
    })
    .catch(function (err) {
      $scope.data.wiki = null;
    });

  };

  $scope.ExecQuerySearch();
}]);
