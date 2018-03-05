runexto.controller('LoginCtrl', ['PreviousState', 'ClientService', '$window', '$scope', '$rootScope', '$http', 'FileUploader', '$state', '$translate', function (PreviousState, client, $window, $scope, $rootScope, $http, FileUploader, $state, $translate) {
  $scope.step = 0;
  $scope.auth = {};

  $scope.loginTaken = false;

  angular.element('#view').click(function(e){
    if (e.target.id === 'view')
      $state.go(PreviousState.Name || 'index');
  });

  var isAllowed = $scope.isAllowed = function(){
    switch ($scope.step){
      case 0:
        return ($scope.user.session.vk || $scope.user.session.fb || $scope.user.session.tw);
        break;
      case 1:
        return ($scope.register.name.length > 0 && $scope.register.surname.length > 0);
        break;
      case 2:
        return (!$scope.loginTaken && $scope.register.link.length > 2 && $scope.register.password.length > 4);
        break;
      case 3:
        return false;
        break;
      default:
        return false;
      break;
    }
  };

  $scope.uploader = new FileUploader({
    queueLimit: 1,
    url:        '/me/upload_photo',
    filters:    [{
      name: 'imageFilter',
      fn:   function (item /*{File|FileLikeObject}*/, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|'.indexOf(type) !== -1;
      }
    }]
  });

  $scope.doRegister = function(){

    $http.post('/me/register', $scope.register)
    .success(function (data, status, headers, config) {
      if (!data.error) {
        // if ($scope.uploader.queue[0])
        //   $scope.uploader.queue[0].upload();

        client.get()
        .then(function(user){
          for (var i in user)
            if (user.hasOwnProperty(i))
              $scope.user[i] = user[i];
          $state.go(PreviousState.Name || 'index');
        });
      } else
        console.log(data);
    });
  };

  $scope.doLogin = function(){
    client.login({
      username: $scope.auth.link,
      password: $scope.auth.password
    })
    .then(function(){
      client.get()
      .then(function(user){
        for (var i in user)
          if (user.hasOwnProperty(i))
            $scope.user[i] = user[i];
        $state.go(PreviousState.Name || 'index');
      });
    });
  };

  $scope.$watch('register.link', _.throttle(function(){
    client.isLoginTaken($scope.register.link)
    .then(function(result){
      $scope.loginTaken = result;
    });
  }, 1000));

  $scope.nextStep = function(){
    if (isAllowed())
      $scope.step++;
  };

  $scope.prevStep = function(){
    $scope.step--;
  };

}]);
