'use strict';

/**
 * @ngdoc function
 * @name jedd.controller:WorldCtrl
 * @description
 * # WorldCtrl
 * Controller of the jedd
 */
angular.module('jedd')
  .controller('world', ['$scope', function ($scope) {
    $scope.scrollbar_config = {
      autoHideScrollbar: false,
      theme: 'dark',
      advanced:{
        updateOnContentResize: true
      },
      scrollInertia: 0
    };

  }]);
