'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:ProjectMenu
 * @description
 * # ProjectMenu
 */
angular.module('jedd')
  .directive('projectMenu', ['$window', function ($window) {
    return {
      templateUrl: 'views/common/project_menu.html',
      restrict: 'E',
      scope: true,
      link: function postLink(scope, element, attrs) {
        var currentProjectName = attrs.current;

        if (!currentProjectName) {
          throw 'Current project name must be specified!'
        }

        scope.currentProjectName = currentProjectName;
        scope.navigateTo = function (url) {
          $window.location = url;
        };

        scope.projects = [
          {
            name: 'VSpace',
            url: 'http://vspace.im/'
          }, {
            name: 'Runexto',
            url: 'http://runexto.com/'
          }, {
            name: 'Hi',
            url: 'http://hi.com'
          }, {
            name: 'YourTape',
            url: 'http://yourtape.me/'
          }, {
            name: 'SpyNotify',
            url: 'http://spynotify.com/'
          }, {
            name: 'Jedd',
            url: 'http://jedd.com/'
          }
        ];
      }
    };
  }]);
