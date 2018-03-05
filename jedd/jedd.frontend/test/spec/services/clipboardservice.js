'use strict';

describe('Service: clipboardService', function () {

  // load the service's module
  beforeEach(module('jedd'));

  // instantiate service
  var clipboardService;
  beforeEach(inject(function (_clipboardService_) {
    clipboardService = _clipboardService_;
  }));

  it('should do something', function () {
    expect(!!clipboardService).toBe(true);
  });

});
