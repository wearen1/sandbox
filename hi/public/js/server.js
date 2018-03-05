angular.module('server', ['ngResource']).
factory('Server', function($resource) {
  var Server = $resource('/:component/api/:action/:convID/:offset',
      {
      },
      {
        post: {
          method: 'POST',
          isArray: false,
          params: {
            component: '@component',
            action: '@action',
            data: '@msg_text',
            conversationID: '@cid'
          }
        },

        get: {
          method: 'GET',
          isArray: false,
          params: {
            component: '@component',
            action: '@action',
            offset: '@offset'
          }
        },

        update: {
          method: 'POST',
          isArray: false,
          params: {
            component: '@component',
            action: '@action',
            offset: '@offset'
          }
        }
      }
  );


  Server.prototype.update = function(cb) {
    return Server.update({id: this._id.$oid},
        angular.extend({}, this, {_id:undefined}), cb);
  };

  Server.prototype.destroy = function(cb) {
    return Server.remove({id: this._id.$oid}, cb);
  };

  return Server;
});