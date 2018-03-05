runexto
.controller('BookmarksCtrl', ['ClientService', '$sce', '$window', '$scope', '$rootScope', '$http', '$localStorage', 'SearchAPIService', function (client, $sce, $window, $scope, $rootScope, $http, $localStorage, sapi) {
    angular.element('footer').fadeOut(500);
    document.body.setAttribute('style', 'overflow: visible');
    //angular.element(body).css({overflow: 'visible'});

    client.bookmarks.all()
    .then(function(result){
        if (result.status === 'ok') {
            console.log(result.bookmarks);
            $scope.bookmarks = result.bookmarks;
        }
    });
}]);
