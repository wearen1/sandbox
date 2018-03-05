runexto.controller('IndexCtrl', ['ClientService', '$scope', '$state', '$rootScope', '$location', '$window', '$translate', function (client, $scope, $state, $rootScope, $location, $window, $translate) {
  // $('body').css({overflow: 'hidden'});
  // $('#show-settings').css({marginTop: '19px'});

  // if (!$scope.user.settings.interface.show_top_menu){
    // $('footer').fadeIn(0);
  // $('#view').css({paddingTop: '67px'});
  // } else
    // $('#view').css({paddingTop: 'px'});
  // $('#view').css({'margin-top': '38px'});

  $scope.ExecQuerySearch = function (evt) {
    if (evt)
      if (evt.which != 13)
        return;
    if ($scope.query.length){
      $rootScope.query = $scope.query;
      // $('body').css({overflow: 'overlay'});
      $state.go('search');
    }
  };
}]);
