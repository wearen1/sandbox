'use strict';

describe('Service: Shutter', function () {

  // load the service's module
  beforeEach(module('jedd'));

  // instantiate service
  var Shutter;
  beforeEach(inject(function (_Shutter_) {
    Shutter = _Shutter_;
  }));

  it('should do something', function () {
    expect(!!Shutter).toBe(true);
  });

});
