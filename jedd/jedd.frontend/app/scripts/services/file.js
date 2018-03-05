'use strict';

/**
 * @ngdoc service
 * @name jedd.File
 * @description
 * # File
 * Service in the jedd.
 */
angular.module('jedd')
  .service('file', ['$resource', function ($resource) {

	// http://localhost:4000/api/v1/v_user/1/directories/1/files.json
	// http://localhost:4000/api/v1/v_users/konstruilo/directories/3/file_nodes.json

	var File = $resource('/api/v1/v_users/:nick/directories/:directory_id/file_nodes/:id.json', {
		nick:'@nick', id: '@id', directory_id: '@directory_id'
	}, {
		list: {
			method: 'GET',
			isArray: true
		},
		create: {
			url: '/api/v1/v_users/:nick/directories/:directory_id/files_nodes.json'
		},
    update: {
      method: 'PUT',
      isArray: true
    }
	});

	// AngularJS will instantiate a singleton by calling "new" on this function
	function list (userNick, directoryId) {
		// return Directory.list({
		// 	nick: userNick,
		// 	id: directoryId
		// }).$promise;
	}

	function create (userNick, directoryId, fileNode) {
		var file = new File({
			nick: userNick,
			directory_id: directoryId,
			file_node: fileNode
		});

		return file.$save();
	}

  function update (userNick, directoryId, fileNode) {
    return File.update({
      nick: userNick,
      directory_id: directoryId,
      id: fileNode.id
    }, fileNode);
  }

	return {
		create: create,
		list: list,
    update: update
	};
}]);
