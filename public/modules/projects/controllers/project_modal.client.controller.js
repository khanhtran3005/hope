'use strict';

// Projects controller
angular.module('projects').controller('ProjectModalController', ['$rootScope', '$scope', '$stateParams', '$location', '$window', '$modalInstance', 'Authentication', 'Projects', 'project', 'isNew',
  function($rootScope, $scope, $stateParams, $location, $window, $modalInstance, Authentication, Projects, project, isNew) {
    $scope.authentication = Authentication;

    $scope.project = {};
    // console.log(isNew);
    $window.focus = {
      tbl: 'project',
      tbl_id: ''
    };

    $scope.show = function() {
      if (typeof project !== 'undefined') {
        $window.focus = {
          tbl: 'project',
          tbl_id: project._id
        };
        $scope.project = project;
      }
      $scope.isNew = isNew;
    };

    $scope.save = function() {
      if (isNew) {
        var project1 = new Projects($scope.project);
        project1.$save(function(project) {
          $scope.project = project;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'project',
            tbl_id: project._id
          };
          $rootScope.currentProject = project;
          $modalInstance.close(project, 'new');
        }, function(errorResponse) {
          console.log(errorResponse.data.message);
        });
      } else {
        var project2 = $scope.project;
        project2.$update(function(project) {
          $scope.project = project;
          $scope.isNew = false;
          $window.focus = {
            tbl: 'project',
            tbl_id: project._id
          };
          $rootScope.currentProject = project;
          $modalInstance.close(project, 'update');
        }, function(errorResponse) {
          console.log(errorResponse.data.message);
        });
      }
    };

    // Remove existing Project
    $scope.remove = function() {
      $scope.project.$remove(function(project) {
        if ($rootScope.currentProject !== undefined && project._id === $rootScope.currentProject._id)
          $rootScope.currentProject = undefined;
        $modalInstance.close(project, 'delete');
      }, function(errorResponse) {
        console.log(errorResponse.data.message);
      });
    };

    // Find existing Project
    $scope.findOne = function() {
      $scope.project = Projects.get({
        projectId: $stateParams.projectId
      });
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

  }
]);
