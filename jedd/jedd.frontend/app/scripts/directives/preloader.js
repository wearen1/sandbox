'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:preloader
 * @description
 * # preloader
 */
angular.module('jedd')
  .directive('preloader', ['$timeout', function ($timeout) {
    return {
      templateUrl: 'views/common/preloader.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {

      }
    };
  }]);
