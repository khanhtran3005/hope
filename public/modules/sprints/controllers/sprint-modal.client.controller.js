'use strict';

angular.module('sprints').controller('SprintModalController', ['$scope', '$stateParams', '$location', '$modalInstance', 'Authentication', 'Sprints', 'sprint', 'SprintHelper', 'socket',
  function($scope, $stateParams, $location, $modalInstance, Authentication, Sprints, sprint, SprintHelper, socket) {
    $scope.sprint = {};
    $scope.duration = {};
    $scope.icons = SprintHelper.icons;
    // $scope.duration.startDate = moment(sprint.startDate);
    // $scope.duration.endDate = moment(sprint.endDate);
    $scope.cancel = function() {
      $scope.sprint = {};
      $scope.duration = {};
      $modalInstance.dismiss('cancel');
    };
    $scope.show = function() {
      $scope.sprint = sprint;
      $scope.duration = {};
      $scope.icons.selected = SprintHelper.getSelectedIcon($scope.icons, sprint.icon);
      $scope.duration.startDate = moment(sprint.startDate);
      $scope.duration.endDate = moment(sprint.endDate);
    };
    $scope.update = function() {
      $scope.sprint.startDate = $scope.duration.startDate;
      $scope.sprint.endDate = $scope.duration.endDate;
      $scope.sprint.icon = $scope.icons.selected.value;
      var sprint = $scope.sprint;

      sprint.$update({
        projectId: $stateParams.projectId
      }, function(res) {
        socket.emit('updateProject', {
          projectId: $stateParams.projectId,
          type: 'sprint',
          msg: 'sprint'
        });
        console.log(res);
        $modalInstance.close(res);
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

  }
]);
