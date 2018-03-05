'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:projectMenuProfileStats
 * @description
 * # projectMenuProfileStats
 */
angular.module('jedd')
  .directive('projectMenuProfileStats', function () {
    return {
      templateUrl: '/views/common/project_menu_profile_stats.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        //element.text('this is the projectMenuProfileStats directive');
      }
    };
  });
