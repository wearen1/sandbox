'use strict';

/**
 * @ngdoc service
 * @name jedd.Shutter
 * @description
 * # Shutter
 * Factory in the jedd.
 */
angular.module('jedd')
  .factory('shutter', ['$rootScope', function($rootScope) {
    var isOpened = false;

    return {
      close: function (shutterId) {
        isOpened = false;
        $rootScope.$broadcast('shutter.close', shutterId);
      },
      open: function (shutterId) {
        isOpened = true;
        $rootScope.$broadcast('shutter.open', shutterId);
      },
      isOpened: isOpened
    };
  }]);
