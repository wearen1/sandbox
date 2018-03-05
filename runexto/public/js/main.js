require.config({
  baseUrl: "js/",
  paths:   {
    'angularAMD':        'lib/amd/angularAMD.min',
    'ngload':            'lib/amd/ngload.min',
    'jquery':            'lib/jquery/jquery-1.11.1.min',
    'mCustomScrollBar':  'lib/jquery/jquery.mCustomScrollbar.concat.min',
    'angular':           'lib/angular/angular.min',
    'ngSanitize':        'lib/angular/angular-sanitize.min',
    'ngAnimate':         'lib/angular/angular-animate.min',
    'ngStorage':         'lib/angular/ngStorage.min',
    'ngResource':        'lib/angular/angular-resource.min',
    'angularFileUpload': 'lib/angular/angular-file-upload.min',
    'ui.router':         'lib/angular/angular-ui-router.min',
    'ui.utils':          'lib/angular/angular-ui-utils.min'
  },
  shim:    {
    'angularAMD': ['angular'],
    'ngload':     ['angularAMD']
  },
  deps:    ['jquery', 'app', 'mCustomScrollBar']
});