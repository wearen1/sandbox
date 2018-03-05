'use strict';

describe('Directive: preloader', function () {

  // load the directive's module
  beforeEach(module('jedd'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<preloader></preloader>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the preloader directive');
  }));
});
