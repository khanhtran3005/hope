'use strict';

//Backlogs service used to communicate Backlogs REST endpoints
angular.module('backlogs').directive('ngDdBacklog', ['BacklogHelper', '$timeout', 'socket',
  function(BacklogHelper, $timeout, socket) {
    return {
      restrict: 'E',
      scope: {
        ngProject: '@ngProject',
        ngSprint: '@ngSprint',
        ngTitle: '@ngTitle',
        ngRemove: '@ngRemove'
      },
      templateUrl: 'modules/backlogs/views/directives/dd-backlog.client.html',
      link: function($scope, iElement, iAttrs, ctrl) {
        $timeout(function() {
          $scope.getBackLogs(iAttrs.ngProject, iAttrs.ngSprint);
        }, 0);
      },
      controller: ['$rootScope', '$scope', '$http', '$stateParams', 'BacklogHelper', function($rootScope, $scope, $http, $stateParams, BacklogHelper) {
        $scope.selected = null;

        $scope.getBackLogs = function(pId, sId) {
          if (!angular.isUndefined(sId)) {
            BacklogHelper.getListBacklogOfSprint(pId, sId, function(data) {
              $scope.backlogs = data;
            });
          } else {
            BacklogHelper.getFreeBacklogOfProject(pId, function(data) {
              $scope.backlogs = data;
            });
          }
        };


        $scope.dragStartrCallback = function(backlog) {
          $rootScope.ddDragBacklog = backlog;
        };

        $scope.movedCallback = function($index) {
          $scope.backlogs.splice($index, 1);
        };

        $scope.dropCallback = function(event, index, backlog, external, type) {
          $rootScope.dropSprint = $scope.ngSprint;
          return backlog;
        };

        $scope.changed = false;

        $scope.$watch('backlogs', function(backlogs) {
          if ($scope.changed) {
            $scope.changed = false;
            return;
          }
          if (!angular.isUndefined($rootScope.ddDragBacklog) && !angular.isUndefined(backlogs)) {
            var backlog_ids = [];
            angular.forEach(backlogs, function(bl) {
              if (!angular.isUndefined(bl._id)) {
                backlog_ids.push(bl._id);
              }
            });
            if ($rootScope.dropSprint === $scope.ngSprint) {
              if (angular.isUndefined($scope.ngSprint)) {
                BacklogHelper.removeBacklogFromSprint($scope.ngProject, $rootScope.ddDragBacklog._id, backlog_ids, function(err, data) {
                  $scope.changed = true;
                  socket.emit('updateProject', {
                    projectId: $scope.ngProject,
                    sprintId: $scope.ngSprint,
                    type: 'sprint_backlogs',
                    msg: 'update_backlogs',
                    err: err
                  });

                });
              } else {
                BacklogHelper.moveBacklogToSprint($scope.ngProject, $scope.ngSprint, $rootScope.ddDragBacklog._id, backlog_ids, function(err, data) {
                  $scope.changed = true;
                  socket.emit('updateProject', {
                    projectId: $scope.ngProject,
                    sprintId: $scope.ngSprint,
                    type: 'sprint_backlogs',
                    msg: 'update_backlogs',
                    err: err
                  });
                });
              }
            }
          }
        }, true);

        $scope.$on('socket:updateProject', function(event, data) {
          if ($scope.ngProject === data.projectId && data.type === 'sprint_backlogs' && ($scope.ngSprint === data.sprintId || $scope.sprintId === undefined)) {
            $scope.getBackLogs($scope.ngProject, $scope.ngSprint);
          }
        });

      }]
    };
  }
]);
