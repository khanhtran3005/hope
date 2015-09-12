'use strict';

// task modal controller
angular.module('tasks').controller('TaskModalController', ['$rootScope', '$scope', '$stateParams', '$location', '$window', '$modalInstance', 'Authentication', 'Teams', 'Backlogs', 'Tasks', 'task', 'backlog', 'project', 'isNew',
  function($rootScope, $scope, $stateParams, $location, $window, $modalInstance, Authentication, Teams, Backlogs, Tasks, task, backlog, project, isNew) {
    $scope.authentication = Authentication;

    $scope.task_status = {
      'To do': 'To do',
      'Processing': 'In process',
      'Done': 'Done'
    };

    $window.focus = {
      tbl: 'Task',
      tbl_id: ''
    };

    $scope.backlog = backlog;
    $scope.project = project;
    $scope.members = project.people;
    if (angular.isUndefined($scope.backlog.assignee) || $scope.backlog.assignee === null || $scope.backlog.assignee ==='deleted') {
      $scope.team = {
        people: []
      };
    } else {
      if (angular.isObject($scope.backlog.assignee)) {
        $scope.team = Teams.get({
          projectId: $scope.project._id,
          teamId: $scope.backlog.assignee._id
        });
      } else {
        $scope.team = Teams.get({
          projectId: $scope.project._id,
          teamId: $scope.backlog.assignee
        });
      }
    }

    $scope.show = function() {
      if (typeof task !== 'undefined') {
        $window.focus = {
          tbl: 'task',
          tbl_id: task._id
        };
        $scope.task = task;
      }
      $scope.isNew = isNew;

    };

    $scope.save = function() {
      if (isNew) {
        var task1 = new Tasks($scope.task);
        task1.$save({
          projectId: $scope.project._id,
          backlogId: $scope.backlog._id
        }, function(task) {
          $scope.task = task;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'task',
            tbl_id: task._id
          };
          $modalInstance.close(true);
        }, function(errorResponse) {
          console.log(errorResponse.data.message);
        });
      } else {
        var task2 = $scope.task;
        task2.$update({
          projectId: $scope.project._id,
          backlogId: $scope.backlog._id
        }, function(task) {
          $scope.task = task;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'task',
            tbl_id: task._id
          };
          $modalInstance.close(true);
        }, function(errorResponse) {
          console.log(errorResponse.data.message);
        });
      }
    };

    // Remove existing Task
    $scope.remove = function() {
      $scope.task.$remove({
        projectId: $scope.project._id,
        backlogId: $scope.backlog._id
      }, function(task) {
        $modalInstance.close('delete');
      }, function(errorResponse) {
        console.log(errorResponse.data.message);
      });
    };


    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    $scope.$watch('task.remaining', function(newVal) {
      if (newVal !== undefined) {
        compute_percent();
      }
    });

    $scope.$watch('task.estimate', function(newVal) {
      if (newVal !== undefined) {
        compute_percent();
      }
    });

    $scope.$watch('task.task_status', function(newVal) {
      if (newVal === 'Done') {
        task.remaining = task.estimate;
        task.work_percent = 100;
        $scope.isDisabledRemaining = true;
      } else {
        $scope.isDisabledRemaining = false;
      }
    });


    function compute_percent() {
      var estimate = task.estimate;
      var remaining = task.remaining;
      if (estimate <= remaining) {
        task.remaining = estimate;
      }
      var percent = Math.round(remaining / estimate * 100);
      if (task.task_status === 'Done') {
        task.work_percent = 100;
      } else {
        task.work_percent = percent;
      }
    }

  }
]);
