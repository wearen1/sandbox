'use strict';

/**
 * @ngdoc overview
 * @name jedd
 * @description
 * # jedd
 *
 * Main module of the application.
 */
angular
  .module('jedd', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.router',
    'angularMoment',
    'angular-click-outside',
    'ngScrollbars',
    'draganddrop'
  ])
  .factory('loading_interceptor', ['$q', '$rootScope', function($q, $rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:start');
        $rootScope.isLoading = true;
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:stop');
        $rootScope.isLoading = false;
        // do something on success
        return response;
      }
    };
  }])
  .config(function ($stateProvider, $urlRouterProvider, $resourceProvider, $locationProvider, $httpProvider) {
    $urlRouterProvider.otherwise('/');

    $httpProvider.interceptors.push('loading_interceptor');

    $locationProvider.html5Mode(false);

    $stateProvider
      .state('news', {
        url: '/news',
        controller: 'news',
        templateUrl: 'views/news/news.html'
      })
      .state('world', {
        url: '/world',
        controller: 'world',
        templateUrl: 'views/world/world.html'
      })
      .state('index', {
        url: '/:selected_user_nick',
        controller: 'index',
        templateUrl: 'views/index/index.html'
      });

      // Don't strip trailing slashes from calculated URLs
    $resourceProvider.defaults.stripTrailingSlashes = true;

  });
