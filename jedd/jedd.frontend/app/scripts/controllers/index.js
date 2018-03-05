'use strict';

/**
 * @ngdoc function
 * @name jedd.controller:IndexCtrl
 * @description
 * # IndexCtrl
 * Controller of the jedd
 */
angular.module('jedd')
  .controller('index', ['$scope', '$timeout', 'user', '$stateParams', '$state', '$rootScope', function ($scope, $timeout, User, $stateParams, $state, $rootScope) {
    // Loading current user
    User.current().then(function (currentUser) {
      $rootScope.current_user = currentUser;

      if (!$stateParams.selected_user_nick) {
      	$state.go('index', {
	        selected_user_nick: currentUser.nick
	      }, {
	        notify: false,
	        reload: false
	      });
      }

      if ($stateParams.selected_user_nick === currentUser.nick) {
      	$rootScope.selected_user = currentUser;
      	$rootScope.$broadcast('selected_user:load', currentUser);
      } else {
	  	User.get($stateParams.selected_user_nick).then(function (selectedUser) {
	    	$rootScope.selected_user = selectedUser;
	    	$rootScope.$broadcast('selected_user:load', selectedUser);
      	});
      }

    });

  }]);
