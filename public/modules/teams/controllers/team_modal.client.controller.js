'use strict';

// team modal controller
angular.module('teams').controller('TeamModalController', ['$scope', '$stateParams', '$location', '$window', '$modalInstance', 'Authentication', 'Teams', 'team', 'project', 'isNew',
  function($scope, $stateParams, $location, $window, $modalInstance, Authentication, Teams, team, project, isNew) {
    $scope.authentication = Authentication;

    $scope.team_types = {
      'Feature': 'Feature',
      'Bug': 'Bug',
      'Spike': 'Spike',
      'Other': 'Other'
    };

    $scope.team_status = {
      'New': 'New',
      'Estimation': 'Ready for estimation',
      'Sprint': 'Ready for sprint',
      'Assigned': 'Assigned to sprint'
    };

    $scope.project = project;
    $scope.members = $scope.project.people;

    $window.focus = {
      tbl: 'team',
      tbl_id: ''
    };

    $scope.show = function() {
      if (typeof team !== 'undefined') {
        $window.focus = {
          tbl: 'team',
          tbl_id: team._id
        };
        $scope.team = team;
      }
      $scope.isNew = isNew;
    };

    $scope.save = function() {
      if (isNew) {
        var team1 = new Teams($scope.team);
        team1.$save({
          projectId: $stateParams.projectId
        }, function(team) {
          $scope.team = team;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'team',
            tbl_id: team._id
          };
          $modalInstance.close(true, team);
        }, function(errorResponse) {
          console.log(errorResponse.data.message);
        });
      } else {
        var team2 = $scope.team;
        team2.$update({
          projectId: $stateParams.projectId
        }, function(team) {
          $scope.team = team;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'team',
            tbl_id: team._id
          };
          $modalInstance.close(true, team);
        }, function(errorResponse) {
          console.log(errorResponse.data.message);
        });
      }
    };

    // Remove existing team
    $scope.remove = function(team) {
      $scope.team.$remove({
        projectId: $stateParams.projectId
      }, function() {
        $modalInstance.close(true, team);
      }, function() {
        $modalInstance.close(false, team);
      });
    };

    // Find existing team
    $scope.findOne = function() {
      $scope.team = Teams.get({
        teamId: $stateParams.teamId
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  }
]);
