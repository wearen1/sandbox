'use strict';

describe('Directive: fileBrowser', function () {

  // load the directive's module
  beforeEach(module('jedd'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<file-browser></file-browser>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the fileBrowser directive');
  }));
});
