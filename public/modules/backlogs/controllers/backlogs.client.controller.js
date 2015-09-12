'use strict';

// Backlogs controller
angular.module('backlogs').controller('BacklogsController', ['$rootScope', '$scope', '$stateParams', '$location', '$modal', 'Authentication', 'BacklogHelper', 'Backlogs', 'Tasks', 'socket',

  function($rootScope, $scope, $stateParams, $location, $modal, Authentication, BacklogHelper, Backlogs, Tasks, socket) {
    $scope.authentication = Authentication;

    $scope.remove = function(backlog) {
      if (backlog) {
        backlog.$remove();

        for (var i in $scope.backlogs) {
          if ($scope.backlogs[i] === backlog) {
            $scope.backlogs.splice(i, 1);
          }
        }
      } else {
        $scope.backlog.$remove(function() {
          $location.path('backlogs');
        });
      }
    };

    $scope.find = function() {
      Backlogs.query({
        projectId: $stateParams.projectId
      }, function(backlogs) {
        // if(backlogs && backlogs.length === 0)
        //   return;
        $scope.backlogs = backlogs;
        if ($scope.backlogs.length !== 0 && $scope.backlog === undefined) {
          $scope.backlog = backlogs[0];
          $scope.backlog.tab_active = true;
        } else {
          for (var i = 0; i < $scope.backlogs.length; i++) {
            if ($scope.backlogs[i]._id.toString() === $scope.backlog._id.toString()) {
              $scope.backlogs[i].tab_active = true;
              break;
            }
          }
        }
      });
    };

    $scope.show = function(backlog) {
      $scope.backlog = backlog;
      $scope.backlog.tab_active = true;
      var modalInstance = $modal.open({
        templateUrl: 'modules/backlogs/views/shared/_backlog.modal.html',
        controller: 'BacklogModalController',
        controllerAs: 'backlog',
        backdrop: 'static',
        size: 'lg',
        resolve: {
          backlog: function() {
            return backlog;
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
          socket.emit('updateProject', {
            projectId: $stateParams.projectId,
            type: 'backlog',
            msg: 'create'
          });
        } else {
          console.log('Create fail!');
        }
      }, function(error) {
        console.log(error);
      });
    };

    $scope.modalNew = function() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/backlogs/views/shared/_backlog.modal.html',
        controller: 'BacklogModalController',
        controllerAs: 'backlog',
        backdrop: 'static',
        // size: 'lg',
        resolve: {
          backlog: function() {
            return {
              backlog_type: 'Feature',
              status: 'New'
            };
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
          socket.emit('updateProject', {
            projectId: $stateParams.projectId,
            type: 'backlog',
            msg: 'update'
          });
        } else {
          console.log('Create fail!');
        }
      }, function(error) {
        console.log(error);
      });
    };

    $scope.backlogAccept = function(backlog) {
      BacklogHelper.acceptBacklog($stateParams.projectId, backlog._id, !backlog.accept, function(err, data) {
        $scope.find();
        socket.emit('updateProject', {
          projectId: $stateParams.projectId,
          msg: 'accept',
          type: 'backlog'
        });
      });
    };

    /**************** KANBAN **********************/
    $scope.dropCallback = function(event, index, item, external, type, status) {
      console.log(item);
      item.task_status = status;
      var task = new Tasks(item);
      task.$update({
        projectId: $scope.project._id,
        backlogId: $scope.backlog._id
      }, function(data) {
        $scope.find();
        socket.emit('updateProject', {
          projectId: $stateParams.projectId,
          type: 'backlog',
          msg: 'task'
        });
      });
    };

    $scope.currentTab = function(backlog_item) {
      $scope.backlog = backlog_item;
      $scope.backlog.tab_active = true;
    };

    /**************** LIST BACKLOG **********************/
    $scope.movedCallback = function($index) {
      $scope.backlogs.splice($index, 1);
      var backlog_ids = [];
      angular.forEach($scope.backlogs, function(bl) {
        if (!angular.isUndefined(bl._id)) {
          backlog_ids.push(bl._id);
        }
      });
      BacklogHelper.orderBacklog($stateParams.projectId, backlog_ids, function(err, data) {
        socket.emit('updateProject', {
          projectId: $stateParams.projectId,
          type: 'backlog',
          msg: 'orderBacklog'
        });
      });
    };

    $rootScope.$on('update_backlog', function(event, old_backlog) {
      $scope.find();
      socket.emit('updateProject', {
        projectId: $stateParams.projectId,
        type: 'backlog',
        msg: 'task'
      });
    });

    /****************SOCKET IO***************************/

    $scope.$on('socket:updateProject', function(event, data) {
      if ($stateParams.projectId === data.projectId && data.type === 'backlog') {
        $scope.find();
      }
    });

  }
]);
