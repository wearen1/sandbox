'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:usercard
 * @description
 * # usercard
 */
angular.module('jedd')
  .directive('projectMenuProfile', ['user', '$rootScope', '$stateParams', '$state',
    function (user, $rootScope, $stateParams, $state) {
    return {
      templateUrl: 'views/common/project_menu_profile.html',
      restrict: 'E',
      scope: true,
      link: function postLink (scope, element, attrs) {

      }
    };
  }]);
