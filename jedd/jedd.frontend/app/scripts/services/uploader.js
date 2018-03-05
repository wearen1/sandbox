'use strict';

/**
 * @ngdoc service
 * @name jedd.Uploader
 * @description
 * # Uploader
 * Service in the jedd.
 */
angular.module('jedd')
  .service('uploader', ['$document', 'shutter', function (document, Shutter) {
    // var uploaderElement = angular.element('drop-uploader');

    document.on('dragenter', function (ev) {
      Shutter.close('#ui_view__shutter');
      // uploaderElement.removeClass('hidden');
    });

    // document.on('drop', function (ev) {
    //   Shutter.open();
    // });

    //document.ondragleave = document.ondragstop = function () {
    //  Shutter.open();
    //};

    // AngularJS will instantiate a singleton by calling "new" on this function
  }]);
