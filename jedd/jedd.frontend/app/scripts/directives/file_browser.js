'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:fileBrowser
 * @description
 * # fileBrowser
 */
angular.module('jedd')
  .directive('fileBrowser', ['$document', 'uploader', '$log', 'user', 'directory', 'file', '$timeout', '$window', '$location', function ($document, uploader, $log, user, directory, file, $timeout, $window, $location) {
    return {
      templateUrl: 'views/index/file_browser.html',
      restrict: 'E',
      scope: true,
      link: function postLink(scope, element, attrs) {
        console.log('scope', scope);

        function isChildOf(parentElement, targetElement) {
          var el = targetElement.parentNode;
          while (el != null) {
            if (el == parentElement) {
              return true;
            }
            el = el.parentNode;
          }
          return false;
        }

        scope.scrollbar_config = {
          autoHideScrollbar: false,
          theme: 'dark',
          advanced:{
              updateOnContentResize: true
          },
          scrollInertia: 0
        };

        scope.isReady = false;
        scope.activeViewType = 'list';
        scope.isScrolling = false;
        scope.isFileSelected = false;

        scope.selectedNodes = [];

        scope.currentUser = null;
        scope.current_directory = null;
        scope.jedd_directory = null;

        scope.dragged_over = null;

        scope.current_directories = [];

        function updateView (directoryId) {
          return directory.list(scope.selected_user.nick, directoryId).then(function (data) {
            scope.jedd_directory = data[0];

            scope.jedd_directory.jedd_nodes = scope.jedd_directory.jedd_directories.map(function (item) {
              item.type = 'directory';
              return item;
            }).concat(scope.jedd_directory.jedd_file_nodes.map(function (item) {
              item.type = 'file';
              return item;
            }));
          }).catch(function (err) {
            console.error(err);
          }).then(function () {
            $timeout(addDragHandlers, 1000);
          });
        }

        function addDragHandlers() {
          angular.element('.file-listing .item').on('dragenter', function (e) {
            e.target.classList.add('drag-over');
          });

          angular.element('.file-listing .item').on('dragleave', function (e) {
            e.target.classList.remove('drag-over');
          });
        }

        // $document.on('dragover', function (e) {
        //   console.log(e);
        // });



        // $document.element('tr').on('click', function (e) {
        //   console.log('click');
        //   console.log(e);
        //   console.log(this);
        // });

        // angular.element('.file-listing .item').on('dragover', function (e) {
        //   console.log('dragover');
        //   console.log(e);
        //   console.log(this);
        // });

        // angular.element('.file-listing .item').on('dragenter', function (e) {
        //   console.log('dragenter');
        //   console.log(e);
        //   console.log(this);
        // });

        // scope.jedd_directory = {
        //   name: 'projects',
        //   jedd_directories: [
        //     {
        //       name: 'yourtape',
        //       size: 1024*1024*2,
        //       created_at: 1448835391569,
        //       is_private: true,
        //       likes: 5,
        //       comments: 5,
        //       reposts: 5,
        //       selected: false,
        //       mime_type: 'directory'
        //     }, {
        //       name: 'spynotify',
        //       size: 1024*1024*3,
        //       created_at: 1448835391569,
        //       is_private: false,
        //       likes: 5,
        //       comments: 5,
        //       reposts: 5,
        //       mime_type: 'directory'
        //     }, {
        //       name: 'runexto',
        //       size: 1024*1024*4,
        //       created_at: 1448835391569,
        //       is_private: true,
        //       likes: 5,
        //       comments: 5,
        //       reposts: 5,
        //       mime_type: 'directory'
        //     }
        //   ],
        //   jedd_files: [
        //     {
        //       name: 'диплом',
        //       extension: 'zip',
        //       size: 1024*1024*100,
        //       created_at: 1448835464715,
        //       is_private: false,
        //       likes: 5,
        //       comments: 5,
        //       reposts: 5,
        //       mime_type: 'zip6'
        //     }, {
        //       name: 'unnamed',
        //       extension: 'txt',
        //       size: 1024*1024/2,
        //       created_at: 1448835464715,
        //       is_private: true,
        //       likes: 0,
        //       comments: 5,
        //       reposts: 5,
        //       mime_type: 'txt2'
        //     }, {
        //       name: 'фото',
        //       extension: 'jpg',
        //       size: 1024*1024 * 2.5,
        //       created_at: 1448835652401,
        //       is_private: false,
        //       likes: 5,
        //       comments: 5,
        //       reposts: 5,
        //       mime_type: 'jpg3'
        //     }
        //   ]
        // };

        // scope.jedd_directory.jedd_nodes = scope.jedd_directory.jedd_directories.map(function (item) {
        //     item.type = 'directory';
        //     return item;
        //   }).concat(scope.jedd_directory.jedd_files.map(function (item) {
        //     item.type = 'file';
        //     return item;
        //   }));

        // console.log(scope.jedd_directory);

        function getIconClassByMimeType (mimeType) {
          // TODO: add real mimetype mappings
          var mappings = {
            'image/jpeg': 'jpg3'
          };

          return mappings[mimeType] || 'flaticon-document325';

          // return (~mimeType.indexOf('/')) ? mimeType.split('/')[1] : mimeType;
        }

        function getNodeByIndex ($index) {
          return scope.jedd_directory.jedd_nodes[$index];
        }

        function updateMime () {
          scope.jedd_directory.jedd_nodes = scope.jedd_directory.jedd_directories.map(function (item) {
            item.type = 'directory';
            return item;
          }).concat(scope.jedd_directory.jedd_file_nodes.map(function (item) {
            item.type = 'file';
            return item;
          }));
        }



        scope.setActiveViewType = function (viewType) {
          if (!~['list', 'grid'].indexOf(viewType)) {
            throw 'Invalid view type';
          }

          scope.activeViewType = viewType;
        };

        scope.toggleLike = function ($index) {
          var node = getNodeByIndex($index);

          node.likes_count += (node.liked ? -1 : 1);
          node.liked ^= 1;

          file.update(scope.selected_user.nick, scope.jedd_directory.id, node);
        };

        scope.toggleFollow = function ($index) {
          var node = getNodeByIndex($index);

          node.followed ^= 1;
        };

        scope.makeRepost = function ($index) {
          var node = getNodeByIndex($index);

        };

        scope.navigateTo = function ($index, directory) {
          scope.current_directories = scope.current_directories.slice(0, $index + 1);
          updateView(scope.current_directories[$index].id);
        };

        scope.open = function ($index) {
          var node = getNodeByIndex($index);

          if (node.type === 'directory') {
            var directory = scope.jedd_directory.jedd_directories[$index];
            scope.current_directories.push(scope.jedd_directory);
            updateView(node.id);
          } else {
            // open file
          }
        };

        scope.showComments = function ($index) {
          var node = getNodeByIndex($index);


        };

        scope.download = function ($index) {
          var node = getNodeByIndex($index);

          $window.open($location.protocol() + '://' + $location.host() + ':8080/download/' + scope.selected_user.id + '/' + scope.jedd_directory.id  + '/' + node.id);
        };

        scope.switch = function ($index) {
          scope.jedd_directory.jedd_nodes[$index].selected = !scope.jedd_directory.jedd_nodes[$index].selected;

          //scope.checked = this.node.selected = !this.node.selected;
        };

        scope.fileIcon = function ($index) {
          return getIconClassByMimeType(getNodeByIndex($index).mime_type);
        };

        scope.$on('selected_user:load', function (selectedUser) {
          console.log('selected_user:load');
          return updateView().then(function () {
            scope.current_directories.push(scope.jedd_directory);
          });
        });



        scope.createDirectory = function () {
          console.log(scope);

          directory.create(scope.selected_user.nick, scope.jedd_directory.id).then(function () {
            updateView();
          });

        };


      }
    };
  }]);
