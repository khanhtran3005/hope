'use strict';

angular.module('teams').controller('ReportTeamController', ['$scope', '$rootScope', '$state', '$http', '$stateParams', '$location', 'Authentication', 'Teams',
  function($scope, $rootScope, $state, $http, $stateParams, $location, Authentication, Teams) {
    $scope.authentication = Authentication;
    if ($rootScope.currentProjectId === '' || $rootScope.currentProjectId === undefined || $rootScope.currentProjectId === null) $state.go('listProjects');

    $scope.find = function() {
      $http.get(
        '/projects/' + $stateParams.projectId + '/teams/develop_teams'
      ).success(function(teams) {
        $scope.teams = teams;
      });
    };

  }
]);
