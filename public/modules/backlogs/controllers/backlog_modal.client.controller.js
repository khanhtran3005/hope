'use strict';

// backlog modal controller
angular.module('backlogs').controller('BacklogModalController', ['$rootScope', '$state', '$http', '$scope', '$stateParams', '$location', '$window', '$modalInstance', 'Authentication', 'Backlogs', 'backlog', 'project', 'isNew',
  function($rootScope, $state, $http, $scope, $stateParams, $location, $window, $modalInstance, Authentication, Backlogs, backlog, project, isNew) {
    $scope.authentication = Authentication;

    if ($rootScope.currentProjectId === '' || $rootScope.currentProjectId === undefined || $rootScope.currentProjectId === null) $state.go('listProjects');

    $scope.backlog_types = {
      'Feature': 'Feature',
      'Bug': 'Bug',
      'Spike': 'Spike',
      'Other': 'Other'
    };

    $scope.backlog_status = {
      'New': 'New',
      'Estimation': 'Ready for estimation',
      'Sprint': 'Ready for sprint',
      'Assigned': 'Assigned to sprint'
    };

    $scope.project = project;
    $scope.members = $scope.project.people;

    $window.focus = {
      tbl: 'backlog',
      tbl_id: ''
    };

    $scope.show = function() {
      if (typeof backlog !== 'undefined') {
        $window.focus = {
          tbl: 'backlog',
          tbl_id: backlog._id
        };
        $scope.backlog = backlog;
      }
      $scope.isNew = isNew;
      $http.get('/projects/' + $stateParams.projectId + '/teams/develop_teams').success(function(teams) {
        $scope.develop_teams = teams;
      });
      if (!isNew && backlog.backlog_status !== 'New') {
        $scope.showTask = true;
      }
      if (backlog.sprint !== undefined && backlog.sprint !== null) {
        $scope.showSprint = true;
      }
    };

    $scope.save = function() {
      if (isNew) {
        var backlog1 = new Backlogs($scope.backlog);
        backlog1.$save({
          projectId: $stateParams.projectId
        }, function(backlog) {
          $scope.backlog = backlog;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'backlog',
            tbl_id: backlog._id
          };
          $modalInstance.close(true);
        }, function(err) {
          console.log(err.data.message);
        });
      } else {
        var backlog2 = new Backlogs($scope.backlog);
        backlog2.$update({
          projectId: $stateParams.projectId
        }, function(backlog) {
          $scope.backlog = backlog;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'backlog',
            tbl_id: backlog._id
          };
          $modalInstance.close(true);
        }, function(err) {
          console.log(err.data.message);
        });
      }
    };

    // Remove existing backlog
    $scope.remove = function(backlog) {
      $scope.backlog.$remove({
        projectId: $stateParams.projectId
      }, function() {
        $modalInstance.close('delete');
      }, function(err) {
        console.log(err.data.message);
      });
    };

    // Find existing backlog
    $scope.findOne = function() {
      $scope.backlog = Backlogs.get({
        backlogId: $stateParams.backlogId
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $rootScope.$on('update_backlog', function(event, old_backlog) {
      $scope.backlog = Backlogs.get({
        projectId: $stateParams.projectId,
        backlogId: old_backlog._id
      });
    });

    $scope.$watch('backlog.point', function(new_value) {
      $scope.hours = $rootScope.currentProject.equivalent * new_value;
      if (backlog.assignee !== null && backlog.assignee !== undefined && backlog.assignee.people !== undefined)
        $scope.hours_team = $rootScope.currentProject.equivalent * backlog.point * backlog.assignee.people.length;
      else
        $scope.hours_team = -1; 
    });

    $scope.$watch('backlog.assignee', function(new_value) {
      if (new_value !== null && new_value !== undefined && new_value !== 'deleted') {
        if (new_value.people !== undefined) {
          $scope.hours_team = $rootScope.currentProject.equivalent * backlog.point * new_value.people.length;
        } else {
          if (typeof new_value !== 'object' && new_value._id !== undefined)
            new_value = JSON.parse(new_value);
          if (new_value.people !== undefined) {
            $scope.hours_team = $rootScope.currentProject.equivalent * backlog.point * new_value.people.length;
          }
        }
      } else
        $scope.hours_team = -1;
    });
  }
]);
