'use strict';

/**
 * @ngdoc directive
 * @name jedd.directive:dropUploader
 * @description
 * # dropUploader
 */
angular.module('jedd')
  .directive('dropUploader', function () {
    return {
      templateUrl: 'views/index/drop_uploader.html',
      restrict: 'E',
      link: function postLink(scope, element, attrs) {
        return;

        var DROPZONE_OPTIONS = {
          url: "/upload",
          paramName: 'file',  // The name that will be used to transfer the file
          maxFiles: 1,
          maxFilesize: 1024,  // MB
          dictDefaultMessage: '',
          createImageThumbnails: false,
          previewsContainer: '#dropzone__hidden'
        };

        var PROGRESS_BAR_CONTAINER_SELECTOR = '#file-picker__progress',
            DROPZONE_SELECTOR               = '#dropzone',
            PICKER_SELECTOR                 = '.file-picker',
            OVERLAY_SELECTOR                = '.file-picker__overlay',
            LINK_SELECTOR                   = '#file-link';

        var Shape = ProgressBar.Circle;

        var RotatingProgressBar = function (Shape, container, opts) {
          this._container = angular.element(container);
          this.bar = new Shape(container, opts);
        };

        RotatingProgressBar.prototype.rotate = function rotate() {
          this._container.addClass('rotating');
        };

        RotatingProgressBar.prototype.stopRotating = function stopRotating() {
          this._container.removeClass('rotating');
        };

        var rotatingBar = new RotatingProgressBar(Shape, PROGRESS_BAR_CONTAINER_SELECTOR, {
          color: '#333',
          trailColor: '#eee',
          strokeWidth: 1,
          duration: 500
        });

        rotatingBar.bar.set(1);

        function initializeDropZone () {
          // scope.$emit('shutter.close');

          Dropzone.options.dropzone = DROPZONE_OPTIONS;
          Dropzone.autoDiscover = false;

          var dropzone = new Dropzone(DROPZONE_SELECTOR),
              picker   = angular.element(PICKER_SELECTOR),
              overlay  = angular.element(OVERLAY_SELECTOR);

          overlay.on('click', function () {
            dropzone.removeAllFiles(true);
          });

          var animateThrottled = _.throttle(
            _.bind(rotatingBar.bar.animate, rotatingBar.bar),
            500
          );

          dropzone.on('sending', function (file) {
            setLink('');
            picker.addClass('uploading');

            rotatingBar.bar.set(0.05);
            rotatingBar.rotate();
          });

          dropzone.on('uploadprogress', function (file, percent) {
            animateThrottled(percent / 100);
          });

          dropzone.on('success', function (file, response) {
            if (response.name === undefined) {
              window.alert('Unknown error while uploading');
              return;
            }

            var url = 'http://shary.in/' + response.name;
            uploadFinally(false, url);
          });

          dropzone.on('error', function (file, errorMessage) {
            uploadFinally(true);
          });

          dropzone.on('addedfile', function (file) {
            console.log(file);
          });

          function uploadFinally (err, url) {
            animateThrottled.cancel();

            if (err) {
              rotatingBar.bar.set(1);
              activateFilePicker();
            } else {
              rotatingBar.bar.animate(1, function() {
                dropzone.removeAllFiles();
                activateFilePicker();
                setLink(url);
              });
            }
          }

          function activateFilePicker () {
            picker.removeClass('uploading');
            rotatingBar.stopRotating();
          }
        }


        function setLink (url) {
          var aElement = angular.element(LINK_SELECTOR);
          aElement.text(url);
          aElement.attr('title', url);
          aElement.attr('href', url);
        }

        initializeDropZone();

      }
    };
  });
