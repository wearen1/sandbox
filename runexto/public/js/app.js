var runexto = angular.module('runexto',
['ui.router', 'ui.utils', 'ngSanitize', 'ngAnimate', 'ngStorage', 'angularFileUpload', 'pascalprecht.translate', 'sticky']
).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$translateProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider) {
  // $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('index', {
    url:           '/',
    templateUrl:   'runexto/index/index.html',
    controller:    'IndexCtrl'
  })
  .state('search', {
    url:           '/search',
    templateUrl:   'runexto/search/search.html',
    controller:    'SearchCtrl'
  })
  .state('hi', {
    url:         '/hi',
    templateUrl: 'http://hi.runexto.com/temps/body.html',
    controller:  'HiCtrl'
  })
  .state('bookmarks', {
    url: '/bookmarks',
    templateUrl: 'runexto/bookmarks/bookmarks.html',
    controller: 'BookmarksCtrl'
  })
  .state('about_us', {
    url: '/about_us',
    templateUrl: 'runexto/static/about_us.html'
  })
  .state('vacancy', {
    url: '/vacancy',
    templateUrl: 'runexto/static/vacancy.html'
  })
  .state('agreement', {
    url: '/agreement',
    templateUrl: 'runexto/static/agreement.html'
  })
  .state('login', {
    url: '/login',
    templateUrl: 'runexto/login/login.html',
    controller: 'LoginCtrl',
    resolve: {
      PreviousState: [
        "$state",
        function ($state) {
            var currentStateData = {
                Name: $state.current.name,
                Params: $state.params,
                URL: $state.href($state.current.name, $state.params)
            };
            return currentStateData;
        }
      ]
    }
  });


  $locationProvider.html5Mode(true);

  $translateProvider.preferredLanguage('ru');

  $translateProvider.useStaticFilesLoader({
    prefix: '/lang/',
    suffix: '.json'
  });

  //console.log($translateProvider.determinePreferredLanguage());

  //$translateProvider.useLocalStorage();
}]);
