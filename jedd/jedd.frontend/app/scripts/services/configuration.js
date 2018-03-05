'use strict';

/**
 * @ngdoc service
 * @name jedd.Configuration
 * @description
 * # Configuration
 * Factory in the jedd.
 */
angular.module('jedd')
  .factory('configuration', function () {
    var staticConfiguration = {
      background_images: [
        {
          url: '/images/walls/1.jpg'
        }, {
          url: '/images/walls/2.jpg'
        }, {
          url: '/images/walls/3.jpg'
        }, {
          url: '/images/walls/4.jpg'
        }, {
          url: '/images/walls/4.png'
        }, {
          url: '/images/walls/5.jpg'
        }, {
          url: '/images/walls/5.png'
        }
      ],
      navigation_menus: [
        {
          name: 'index',
          title: 'Index'
        }, {
          name: 'world',
          title: 'World'
        }, {
          name: 'news',
          title: 'News'
        }
      ]
    };

    return {
      background_images: staticConfiguration.background_images,
      navigation_menus: staticConfiguration.navigation_menus
    };
  });
