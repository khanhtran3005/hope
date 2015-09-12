'use strict';

// Sprints controller
angular.module('sprints').controller('SprintsController', ['$rootScope', '$scope', '$window', '$stateParams', '$location', 'Authentication', 'Sprints', 'SprintHelper', 'Comments', '$filter', '$timeout', '$modal', '$state', 'CommentHelper', 'ProjectHelper', 'socket', '$http', 'BacklogHelper',
  function($rootScope, $scope, $window, $stateParams, $location, Authentication, Sprints, SprintHelper, Comments, $filter, $timeout, $modal, $state, CommentHelper, ProjectHelper, socket, $http, BacklogHelper) {
    $scope.authentication = Authentication;
    // $scope.daterange = {};

    if ($rootScope.currentProjectId === '' || $rootScope.currentProjectId === undefined || $rootScope.currentProjectId === null) $state.go('listProjects');

    $window.focus = {
      tbl: 'sprint',
      tbl_id: ''
    };

    $scope.projectId = $stateParams.projectId;
    $scope.sprintId = $stateParams.sprintId;

    $scope.description = '';
    var year = moment().year(),
      month = moment().months() + 1,
      date = moment().date();

    $scope.today = year + '-' + month + '-' + date;
    $scope.icons = SprintHelper.icons;
    $scope.icons.selected = $scope.icons[0];
    $scope.color = '#0aa699';
    // Create new Sprint
    $scope.create = function() {
      var that = this;
      // Create new Sprint object
      var sprint = new Sprints({
        name: that.name,
        description: that.description,
        startDate: that.daterange.startDate,
        endDate: that.daterange.endDate,
        projectId: $rootScope.currentProject._id,
        icon: $scope.icons.selected.value,
        color: $scope.color
      });

      // Redirect after save
      sprint.$save({
        projectId: $stateParams.projectId
      }, function(response) {
        socket.emit('updateProject', {
          projectId: $stateParams.projectId,
          type: 'sprint',
          msg: 'sprint'
        });
        $state.go('viewProject.listSprints', {
          projectId: $rootScope.currentProject._id
        });
        $scope.daterange = {};
        // Clear form fields
        $scope.name = '';
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Sprint
    $scope.remove = function(sprint) {
      $scope.sprint.$remove({
        projectId: $stateParams.projectId
      }, function() {
        $state.go('viewProject.listSprints', {
          projectId: $rootScope.currentProject._id
        });
      });
    };

    // Update existing Sprint
    $scope.update = function() {
      $window.focus = {
        tbl: 'sprint',
        tbl_id: $stateParams.sprintId
      };
      $scope.sprint.startDate = this.duration.startDate;
      $scope.sprint.endDate = this.duration.endDate;

      var sprint = $scope.sprint;

      sprint.$update({
        projectId: $stateParams.projectId
      }, function() {
        socket.emit('updateProject', {
          projectId: $stateParams.projectId,
          type: 'sprint',
          msg: 'sprint'
        });
        $scope.updated = true;
        $timeout(function() {
          $scope.updated = false;
        }, 3000);
        $state.go('viewProject.listSprints', {
          projectId: $rootScope.currentProject._id
        });
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Sprints
    $scope.find = function() {
      // if (typeof $rootScope.currentProject !== 'undefined' && $rootScope.currentProject._id.trim() !== '') {
      var projectId = $stateParams.projectId;
      Sprints.query({
        projectId: $stateParams.projectId
      }, function(data) {
        $scope.sprints = data;
        initScroller();
      });
    };

    $scope.sprint = {};
    // Find existing Sprint
    $scope.findOne = function(sprintId) {
      $window.focus = {
        tbl: 'sprint',
        tbl_id: $stateParams.sprintId
      };
      var spId = $stateParams.sprintId || sprintId;
      $scope.sprint = Sprints.get({
        sprintId: spId,
        projectId: $stateParams.projectId
      }, function(sprint) {
        $scope.duration = {};
        $scope.duration.startDate = moment(sprint.startDate);
        $scope.duration.endDate = moment(sprint.endDate);
        initScroller();
        if ($state.is('viewSprint')) {
          CommentHelper.loadComment('sprint', $stateParams.sprintId, function(sprint) {
            $scope.comments = sprint;
          });
        }
        $http.get('/projects/' + $stateParams.projectId + '/teams/develop_teams').success(function(teams) {
          $scope.develop_teams = teams;
          findBacklogs();
        });
      }, function(sprint) {
        $state.go('viewProject.listSprints', {
          projectId: $stateParams.projectId
        });
      });
    };

    $scope.toggleComment = function($event, $index) {
      var $this = $($event.currentTarget),
        ele = '.comment-form-' + $index,
        $ele = $(ele);
      if ($this.hasClass('collapse')) {
        $ele.slideUp({
          duration: 150,
          done: function() {
            $this.removeClass('collapse')
              .addClass('expand');
          }
        });
      } else {
        $ele.slideDown({
          duration: 150,
          done: function() {
            $this.removeClass('expand')
              .addClass('collapse');
          }
        });
      }
    };

    function initScroller() {
      setTimeout(function() {
        $('.scroller').each(function() {
          $(this).slimScroll({
            size: '7px',
            color: '#a1b2bd',
            allowPageScroll: true,
            height: $(this).attr('data-height'),
            alwaysVisible: ($(this).attr('data-always-visible') === '1' ? true : false),
            railVisible: ($(this).attr('data-rail-visible') === '1' ? true : false),
            disableFadeOut: true
          });
        });
      }, 50);
    }

    $scope.show = function(sprintId) {
      Sprints.get({
        sprintId: sprintId,
        projectId: $stateParams.projectId
      }, function(sprint) {
        var modalInstance = $modal.open({
          templateUrl: 'modules/sprints/views/modal/edit-sprint.modal.view.html',
          controller: 'SprintModalController',
          controllerAs: 'sprint',
          backdrop: 'static',
          resolve: {
            sprint: function() {
              return sprint;
            }
          }
        });
        modalInstance.result.then(function(item) {
          var k = -1;
          var sprints = $scope.sprints;
          for (var i = 0; i < sprints.length; i++) {
            if (item._id === sprints[i]._id) {
              k = i;
              break;
            }
          }
          if (k >= 0) {
            var today = moment(),
              sprintEndDate = moment(item.endDate);
            if (today > sprintEndDate) {
              $scope.sprints.splice(k, 1);
              $scope.sprints.push(item);
            } else {
              $scope.sprints[k] = item;
              for (var l = 0; l < $scope.sprints.length - 1; l++) {
                for (var j = 1; j < $scope.sprints.length; j++) {
                  var iStartDate = moment($scope.sprints[l].startDate),
                    jStartDate = moment($scope.sprints[j].startDate);

                  if (iStartDate > jStartDate) {
                    var temp = $scope.sprints[l];
                    $scope.sprints[l] = $scope.sprints[j];
                    $scope.sprints[j] = temp;
                  }
                }
              }
            }
          } else
            $scope.sprints.unshift(item);
        }, function() {
          console.log('Modal dismissed at: ' + new Date());
        });
      });
    };
    this.iconSelected = function($item) {
      $scope.icons.selected = $item;
    };

    $scope.$on('socket:updateProject', function(event, data) {
      if ($stateParams.projectId === data.projectId && data.type === 'sprint') {
        $scope.find();
      }
    });

    /****************** DRAG DROP ******************/
    $scope.movedTeamCallback = function(backlog) {
      for (var i = 0; i < $scope.sprint_backlogs.length; i++) {
        if (backlog._id.toString() === $scope.sprint_backlogs[i]._id.toString()) {
          $scope.sprint_backlogs.splice(i, 1);
          break;
        }
      }
    };

    $scope.movedFreeCallback = function(backlog) {
      for (var i = 0; i < $scope.free_backlogs.length; i++) {
        if (backlog._id.toString() === $scope.free_backlogs[i]._id.toString()) {
          $scope.free_backlogs.splice(i, 1);
          break;
        }
      }
    };

    $scope.dropTeamCallback = function(event, index, backlog, external, type, team) {
      // var backlog_ids = [];
      // angular.forEach($scope.sprint_backlogs, function(bl) {
      //   if (!angular.isUndefined(bl._id)) {
      //     backlog_ids.push(bl._id);
      //   }
      // });
      if (team === null || team === undefined) team = {
        _id: 'deleted'
      };
      BacklogHelper.moveBacklogToSprint($stateParams.projectId, $stateParams.sprintId, backlog._id, {
        backlog_ids: [],
        team: team._id
      }, function(err, data) {
        if (!err) {
          findBacklogs();
          socket.emit('updateProject', {
            projectId: $stateParams.projectId,
            sprintId: $stateParams.sprintId,
            type: 'sprint_backlogs',
            msg: 'update_backlogs'
          });
        }
      });
    };

    $scope.dropFreeCallback = function(event, index, backlog, external, type, team) {
      if (team === null || team === undefined) team = {
        _id: 'deleted'
      };
      BacklogHelper.removeBacklogFromSprint($stateParams.projectId, backlog._id, {
        team: team._id
      }, function(err, data) {
        if (!err) {
          findBacklogs();
          socket.emit('updateProject', {
            projectId: $stateParams.projectId,
            sprintId: $stateParams.sprintId,
            type: 'sprint_backlogs',
            msg: 'update_backlogs'
          });
        }
      });
    };

    $scope.sumHours = function(list, team) {
      if (list !== undefined) {
        var h = 0;
        if (team !== undefined) {
          for (var i = 0; i < list.length; i++) {
            if (list[i].assignee !== undefined && list[i].assignee !== null && list[i].assignee._id === team) {
              h += list[i].hours;
            }
          }
        } else {
          for (var j = 0; j < list.length; j++) {
            if (list[j].assignee === undefined || list[j].assignee === null) {
              h += list[j].hours;
            }
          }
        }
        return h;
      } else
        return 0;
    };

    $scope.countBacklogs = function(list, team) {
      if (list !== undefined) {
        var h = 0;
        if (team !== undefined) {
          for (var i = 0; i < list.length; i++) {
            if (list[i].assignee !== undefined && list[i].assignee !== null && list[i].assignee._id === team) {
              h += 1;
            }
          }
        } else {
          for (var j = 0; j < list.length; j++) {
            if (list[j].assignee === undefined || list[j].assignee === null) {
              h += 1;
            }
          }
        }
        return h;
      } else
        return 0;
    };

    function findBacklogs(sprintId) {
      var spId = $stateParams.sprintId || sprintId;
      BacklogHelper.getListBacklogOfSprint($stateParams.projectId, spId, function(data) {
        $scope.sprint_backlogs = data;
      });
      BacklogHelper.getFreeBacklogOfProject($stateParams.projectId, function(data) {
        $scope.free_backlogs = data;
      });
    }

    $scope.$on('socket:updateProject', function(event, data) {
      if ($stateParams.projectId === data.projectId && $stateParams.sprintId === data.sprintId && data.type === 'sprint_backlogs') {
        findBacklogs();
      }
      if ($stateParams.projectId === data.projectId && data.type === 'sprint') {
        $scope.find();
      }
    });
  }
]);
