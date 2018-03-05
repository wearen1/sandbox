'use strict';

describe('Directive: dropUploader', function () {

  // load the directive's module
  beforeEach(module('jedd'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<drop-uploader></drop-uploader>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the dropUploader directive');
  }));
});
