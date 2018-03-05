'use strict';

describe('Directive: uploadButton', function () {

  // load the directive's module
  beforeEach(module('jedd'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<upload-button></upload-button>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the uploadButton directive');
  }));
});
