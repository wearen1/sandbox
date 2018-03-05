var runexto = angular.module('runexto',
['ui.router', 'ui.utils', 'ngAnimate', 'pascalprecht.translate']
).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$translateProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
  .state('welcome', {
    url:  '/',
    templateUrl: 'runexto/welcome/welcome.html',
    controller: 'WelcomeCtrl'
  });

  $locationProvider.html5Mode(true);

  $translateProvider.preferredLanguage('ru');

  $translateProvider.useStaticFilesLoader({
    prefix: '/lang/',
    suffix: '.json'
  });
}]);

runexto.controller('WelcomeCtrl', function($scope){

});
