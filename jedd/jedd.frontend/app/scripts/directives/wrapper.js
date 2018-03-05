'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:wrapper
 * @description
 * # wrapper
 */
angular.module('jedd')
  .directive('wrapper', ['configuration', '$interval', function (Configuration, $interval) {
    return {
      restrict: 'E',
      transclude: false,
      link: function postLink(scope, element, attrs) {
        angular.element(element).addClass('wrapper');

        function setBackgroundImageById (backgroundImageId) {
          if (backgroundImageId < 0 || backgroundImageId >= Configuration.background_images.length) {
            throw 'backgroundImageId out of bounds';
          }

          angular.element(element).css({
            backgroundImage: 'url(' + Configuration.background_images[backgroundImageId].url + ')'
          });
        }

        // TODO: grab value from user configuration
        setBackgroundImageById(0);
      }
    };
  }]);
