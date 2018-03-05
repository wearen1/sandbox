runexto
.factory('ClientService', ['$http', '$q', '$rootScope', function ($http, $q, $rootScope) {
  var user = {};

  var getUser = function(){
    var d = $q.defer();
    $http.get('/me')
    .success(function (data, status, headers, config) {
      console.log('#get_user data:', data);
      user = data;
      d.resolve(user);
    })
    .error(function (data, status, headers, config) {
      console.error('#get_user error:', data);
      d.resolve(null);
    });
    return d.promise;
  };

  var saveUser = function(_user){
    user = _user || user;

    var d = $q.defer();
    $http.post('/me/settings', user.settings)
    .success(function (data, status, headers, config){
      console.log('#save_user result:', data);
      d.resolve(true);
    })
    .error(function (data, stauts, headers, config){
      console.error('#save_user error:', data);
      d.resolve(null);
    });
    return d.promise;
  };

  var isLoginTaken = function(login){
    var d = $q.defer();

    if (login && login.length){
      $http.post('/me/checkLogin', {login: login})
      .success(function(data, status, headers, config){
        if (data.exists)
          d.resolve(true);
        else
          d.resolve(false);
      })
      .error(function(data, status, headers, config){
        d.resolve(false);
      });
    } else
      d.resolve(false);

    return d.promise;
  };

  var login = function(credentials){
    console.log('loging using', credentials);

    var d = $q.defer();

    if (typeof credentials.username !== 'undefined' && typeof credentials.password !== 'undefined'){
      $http.post('/oauth/login', credentials)
      .success(function (data, status, headers, config){
        console.log('#login result:', data);
        d.resolve(data);
      })
      .error(function (data, status, headers, config){
        console.error('#login error:', data);
        d.resolve(null);
      });
    } else {
      console.error('#login error:', 'credentails set incorrect');
      d.resolve(null);
    }
    return d.promise;
  };

  var logout = function(){
    var d = $q.defer();
    $http.post('/me/logout')
    .success(function (data, status, headers, config){
      console.log('#logout result:', data);
      d.resolve(data);
    })
    .error(function (data, status, headers, config){
      console.error('#logout error:', data);
      d.resolve(null);
    });
    return d.promise;
  };

  var addBookmark = function(url){
    var d = $q.defer();
    $http.post('/me/bookmark/' + encodeURIComponent(url))
    .success(function (data, stauts, headers, config){
      console.log('#add_bookmark result:', data);
      d.resolve(data);
    })
    .error(function (data, status, headers, config){
      console.error('#add_bookmark error:', data);
      d.resolve(null);
    });
    return d.promise;
  };

  var delBookmark = function(){
    var d = $q.defer();
    $http.delete('/me/bookmark/' + encodeURIComponent(url))
    .success(function (data, status, headers, config){
      console.log('#del_bookmark result:', data);
      d.resolve(data);
    })
    .error(function (data, status, headers, config){
      console.error('#del_bookmark error:', data);
      d.resolve(null);
    });
    return d.promise;
  };

  var getBookmarks = function(){
    var d = $q.defer();
    $http.get('/me/bookmark/list')
    .success(function (data, status, headers, config){
      console.log('#get_bookmarks result:', data);
      d.resolve(data);
    })
    .error(function (data, status, headers, config){
      console.error('#get_bookmarks error:', data);
      d.resolve(null);
    });
    return d.promise;
  };

  return {
    get: function(){
      return getUser()
      .then(function(user){
        return user;
      })
      .catch(function(e){
        return null;
      });
    },
    set: saveUser,
    login: login,
    isLoginTaken: isLoginTaken,
    logout: logout,
    bookmarks: {
      add: addBookmark,
      del: delBookmark,
      all: getBookmarks
    }
  };
}])
.factory('SearchAPIService', ['$http', '$q', function ($http, $q) {
  return {
    joinGroup:      function (preview) {
      var d = $q.defer();
      $http({method: 'POST', url: '/api/join', data: {post: preview.post.id, group: preview.post.from_id}})
      .success(function (data, status, headers, config) {
        console.log(data);
        d.resolve(data);
      });
      return d.promise;
    },
    addRepost:      function (preview) {
      var d = $q.defer();
      $http({method: 'POST', url: '/api/repost', data: {post: preview.post.id, group: preview.post.from_id}})
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
        url:    '/api/comment',
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
      $http({method: 'POST', url: '/api/like', data: {post: preview.post.id, group: preview.post.from_id}})
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
        url:    '/preview',
        data:   { post: post.id, group: post.author.info.id, source: post.author.source}
      })
      .success(function (data, status, headers, config) {
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        d.reject(data);
      });
      return d.promise;
    },
    getWikiPreview: function (query) {
      var d = $q.defer();
      $http({method: 'POST', url: '/preview', data: {source: 2, query: query}})
      .success(function (data, status, headers, config) {
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        d.reject(data);
      });
      return d.promise;
    },
    doSearch:      function (query, options) {
      var sources = options.sources,
        types = options.types,
        from = options.from,
        page = options.page;

      var querySources = [];
      if (sources.wiki)
        querySources.push('wiki_articles');
      if (sources.tw)
        querySources.push('tw_tweets');
      if (types.events){
        querySources.push('tw_users');
        if (sources.vk)
          querySources.push('vk_events');
        if (sources.fb)
          querySources.push('fb_events');
      }
      if (types.groups){
        if (sources.vk)
          querySources.push('vk_groups');
        if (sources.fb)
          querySources.push('fb_groups');
        if (sources.tw)
          querySources.push('tw_groups');
      }
      if (types.posts){
        if (sources.vk)
          querySources.push('vk_posts');
        if (sources.fb)
          querySources.push('fb_posts');
      }

      var d = $q.defer();
      $http({method: 'POST', url: '/search', data: {
        query: query,
        from: from,
        types: types,
        sources: querySources,
        page: page
      }})
      .success(function (data, status, headers, config) {
        d.resolve(data);
      })
      .error(function (data, status, headers, config) {
        d.reject(data);
      });
      return d.promise;
    }
  };
}]);
