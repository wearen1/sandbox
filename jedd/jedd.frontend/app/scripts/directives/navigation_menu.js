'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:navigationMenu
 * @description
 * # navigationMenu
 */
angular.module('jedd')
  .directive('navigationMenu', ['configuration', function (Configuration) {
    return {
      templateUrl: 'views/index/navigation_menu.html',
      scope: true,
      transclude: false,
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.navigation_menus = Configuration.navigation_menus;

      }
    };
  }]);
