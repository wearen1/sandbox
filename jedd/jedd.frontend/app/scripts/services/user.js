'use strict';

/**
 * @ngdoc service
 * @name jedd.user
 * @description
 * # user
 * Service in the jedd.
 */
angular.module('jedd')
  .service('user', ['$resource', function ($resource) {

    var User = $resource('/api/v1/v_users/:nick.json', {
      nick:'@nick'
    }, {
      search: {
        method: 'GET',
        isArray: true,
        url: '/api/v1/v_users/search'
      }
    });


    function search (queryOptions) {
      return User.search(queryOptions).$promise;
    }

    // AngularJS will instantiate a singleton by calling "new" on this function
    function list (userId, directoryId) {
      return Directory.list({
        userId: userId,
        directoryId: directoryId
      }).$promise;
    }

    function current () {
      return User.get({nick: 'current'}).$promise;
    }


    function get (nick) {
      return User.get({nick: nick}).$promise;
    }

    return {
      current: current,
      search: search,
      get: get
    };
  }]);
