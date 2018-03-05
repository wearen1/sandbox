'use strict';

/**
 * @ngdoc service
 * @name jedd.File
 * @description
 * # File
 * Service in the jedd.
 */
angular.module('jedd')
  .service('directory', function ($resource) {

	// http://localhost:4000/api/v1/v_user/1/directories.json

	var Directory = $resource('/api/v1/v_users/:nick/directories/:id.json', {
		nick:'@nick', id: '@id'
	}, {
		list: {
			method: 'GET',
			isArray: true
		},
		create: {
			url: '/api/v1/v_users/:nick/directories.json'
		}
	});

	// AngularJS will instantiate a singleton by calling "new" on this function
	function list (userNick, directoryId) {
		return Directory.list({
			nick: userNick,
			id: directoryId
		}).$promise;
	}

	function create (userNick, directoryId) {
		var directory = new Directory({ name: 'New Directory', jedd_directory_id: directoryId, nick: userNick });
		// directory.name = "New Directory";
		return directory.$save();
	}

	return {
		create: create,
		list: list
	};
});
