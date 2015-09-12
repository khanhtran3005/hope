'use strict';

angular.module('meetings').controller('ConfirmUploadModalController', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {
    $scope.recorded = {};
    $scope.recorded.upload = false;
    $scope.recorded.title = '';

    $scope.upload = function() {
      $scope.recorded.upload = true;
      $modalInstance.close($scope.recorded);
    };
    $scope.cancel = function() {
      $modalInstance.close();
    };
  }
]);
