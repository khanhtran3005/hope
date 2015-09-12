'use strict';

angular.module('projects').controller('ReportMemberController', ['$rootScope', '$state', '$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$http',
  function($rootScope, $state, $scope, $stateParams, $location, Authentication, Projects, $http) {
    $scope.authentication = Authentication;
    if ($rootScope.currentProjectId === '' || $rootScope.currentProjectId === undefined || $rootScope.currentProjectId === null) $state.go('listProjects');

    $scope.findOne = function() {
      $http.get(
        '/projects/' + $stateParams.projectId + '/members/' + $stateParams.userId + '/report'
      ).success(function(data) {
        $scope.data = data;
      });
    };

  }
]);
