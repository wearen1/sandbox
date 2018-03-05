'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:shutter
 * @description
 * # shutter
 */
angular.module('jedd')
  .directive('shutter', ['shutter', function (Shutter) {
    return {
      template: '<div class="shutter"></div>',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        var shutterElement = angular.element(element);

        scope.$on('shutter.open', function (shutterSelector) {
          if (!shutterSelector || !shutterElement.is(angular.element(shutterSelector))) {
            shutterElement.removeClass('closed');
            shutterElement.addClass('opened');
          }
        });

        scope.$on('shutter.close', function (shutterSelector) {
          if (!shutterSelector || !shutterElement.is(angular.element(shutterSelector))) {
            shutterElement.addClass('closed');
            shutterElement.removeClass('opened');
          }
        });

      }
    };
  }]);
