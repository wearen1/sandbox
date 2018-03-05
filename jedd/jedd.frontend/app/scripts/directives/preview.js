'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:preview
 * @description
 * # preview
 */
angular.module('jedd')
  .directive('preview', function () {
    return {
      templateUrl: 'views/common/preview.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.close = function () {
          scope.$emit('shutter.open');
          angular.element(element).addClass('hidden');
        };

        scope.open = function () {
          scope.$emit('shutter.close');
          angular.element(element).removeClass('hidden');
        };

        scope.close();

      }
    };
  });
