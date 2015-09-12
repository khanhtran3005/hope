'use strict';

// Audits controller
angular.module('audits').controller('AuditsController', ['$scope', '$stateParams', '$location', '$window', 'Authentication', 'Audits', 'hopeUI',
  function($scope, $stateParams, $location, $window, Authentication, Audits, hopeUI) {
    $scope.authentication = Authentication;

    // Find a list of Audits
    $scope.find = function() {
      if ($window.focus.tbl_id !== '' && $window.focus.tbl !== '') {
        $scope.audits = Audits.query($window.focus, function() {
          hopeUI.initSlimscroll();
        });
      } else {
        $scope.audits = [];
        hopeUI.initSlimscroll();
      }
    };

  }
]);
