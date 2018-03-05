'use strict';

describe('Controller: WorldCtrl', function () {

  // load the controller's module
  beforeEach(module('jedd'));

  var WorldCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    WorldCtrl = $controller('WorldCtrl', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(WorldCtrl.awesomeThings.length).toBe(3);
  });
});
