'use strict';

describe('Directive: navigationMenu', function () {

  // load the directive's module
  beforeEach(module('jedd'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<navigation-menu></navigation-menu>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the navigationMenu directive');
  }));
});
