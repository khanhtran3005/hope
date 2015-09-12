'use strict';

// Tasks controller
angular.module('tasks').controller('TasksController', ['$rootScope', '$scope', '$stateParams', '$location', '$modal', 'Authentication', 'Tasks',
  function($rootScope, $scope, $stateParams, $location, $modal, Authentication, Tasks) {
    $scope.authentication = Authentication;

    $scope.kanban = false;

    // Find a list of Tasks
    $scope.find = function() {
      $scope.tasks = Tasks.query({
        projectId: $scope.project._id,
        backlogId: $scope.backlog._id
      });
    };

    $scope.modalNew = function() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/tasks/views/shared/_task.modal.html',
        controller: 'TaskModalController',
        controllerAs: 'task',
        backdrop: 'static',
        // size: 'sm',
        resolve: {
          task: function() {
            return {
              task_status: 'To do'
            };
          },
          backlog: function() {
            return $scope.backlog;
          },
          project: function() {
            return $scope.project;
          },
          isNew: function() {
            return true;
          }
        }
      });

      modalInstance.result.then(function(result) {
        if (result) {
          $scope.find();
          $rootScope.$broadcast('update_backlog', $scope.backlog);
        } else {
          console.log('Create fail!');
        }
      }, function(error) {
        console.log(error);
      });
    };

    $scope.show = function(task) {
      $scope.task = task;
      var modalInstance = $modal.open({
        templateUrl: 'modules/tasks/views/shared/_task.modal.html',
        controller: 'TaskModalController',
        controllerAs: 'task',
        backdrop: 'static',
        // size: 'sm',
        resolve: {
          task: function() {
            return $scope.task;
          },
          backlog: function() {
            return $scope.backlog;
          },
          project: function() {
            return $scope.project;
          },
          isNew: function() {
            return false;
          }
        }
      });

      modalInstance.result.then(function(result) {
        if (result) {
          $scope.find();
          $rootScope.$broadcast('update_backlog', $scope.backlog);
        } else {
          console.log('Create fail!');
        }
      }, function(error) {
        console.log(error);
      });
    };

    $scope.findKanban = function(backlog, kanban) {
      $scope.kanban = kanban;
      $scope.tasks = Tasks.query({
        projectId: $scope.project._id,
        backlogId: backlog._id
      });
    };
  }
]);
