'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:modalView
 * @description
 * # modalView
 */
angular.module('jedd')
  .directive('modal', function () {
    return {
      templateUrl: 'views/common/modal.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        scope.close = function () {
          scope.$emit('shutter.open');
          angular.element(element).addClass('hidden');
        };


        //element.text('this is the modalView directive');
      }
    };
  });
