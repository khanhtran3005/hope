'use strict';

//Backlogs service used to communicate Backlogs REST endpoints
angular.module('teams').directive('rpTeam', ['Teams', '$timeout',
  function(Teams, $timeout) {
    return {
      restrict: 'E',
      scope: {
        ngProject: '@ngProject',
        ngTeam: '@ngTeam',
      },
      templateUrl: 'modules/teams/views/shared/_report_team.directive.client.html',
      link: function($scope, iElement, iAttrs, ctrl) {
        $timeout(function() {
          $scope.find(iAttrs.ngProject, iAttrs.ngTeam);
        }, 0);
      },
      controller: ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {
        $scope.find = function(projectId, teamId) {
          if (projectId !== undefined && teamId !== undefined) {
            $http.get(
              '/projects/' + $stateParams.projectId + '/teams/' + teamId + '/report'
            ).success(function(data) {
              $scope.data = data;
            }).error(function() {
              $scope.data = [];
            });
          }
        };

        $scope.sumTimeSprint = function() {
          var time = 0;
          for (var i = 0; i < $scope.data.sprints.length; i++) {
            time += $scope.data.sprints[i].time_hour;
          }
          return time;
        };

        $scope.sumPointLBacklogs = function() {
          var point = 0;
          for (var i = 0; i < $scope.data.backlogs.length; i++) {
            if ($scope.data.backlogs[i].sprint !== null && $scope.data.backlogs[i].sprint !== undefined)
              point += $scope.data.backlogs[i].point;
          }
          return point;
        };

        $scope.sumTimeBacklogs = function() {
          var time = 0;
          for (var i = 0; i < $scope.data.backlogs.length; i++) {
            if ($scope.data.backlogs[i].sprint !== null && $scope.data.backlogs[i].sprint !== undefined)
              time += $scope.data.backlogs[i].hours;

          }
          return time;
        };

        $scope.getBacklogs = function(backlogs, sprintId) {
          var bgs = [];
          for (var i = 0; i < backlogs.length; i++) {
            if (backlogs[i].sprint !== undefined && backlogs[i].sprint._id.toString() === sprintId.toString()) {
              bgs.push(backlogs[i]);
            }
          }
          return bgs;
        };

        $scope.getBacklog = function(backlogs, sprint) {
          var bgs = [];
          for (var i = 0; i < backlogs.length; i++) {
            if (backlogs[i].sprint !== undefined && backlogs[i].sprint !== null && backlogs[i].sprint._id === sprint._id)
              bgs.push(backlogs[i]);
          }
          return bgs;
        };

        $scope.getBacklogCompleted = function(backlogs, sprint) {
          var bgs = $scope.getBacklog(backlogs, sprint);
          var bgs_completed = [];
          for (var i = 0; i < bgs.length; i++) {
            if (bgs[i].accept === true)
              bgs_completed.push(bgs[i]);
          }
          return bgs_completed;
        };

        $scope.getBacklogUncompleted = function(backlogs, sprint) {
          var bgs = $scope.getBacklog(backlogs, sprint);
          var bgs_uncompleted = [];
          for (var i = 0; i < bgs.length; i++) {
            if (bgs[i].accept === false)
              bgs_uncompleted.push(bgs[i]);
          }
          return bgs_uncompleted;
        };

        $scope.getTimeTaskEstimate = function(backlogs, sprint) {
          var bgs = $scope.getBacklog(backlogs, sprint);
          var time = 0;
          for (var i = 0; i < bgs.length; i++) {
            for (var j = 0; j < bgs[i].tasks.length; j++) {
              time += bgs[i].tasks[j].compute_estimate;
            }
          }
          return time;
        };

        $scope.getTimeTaskComplete = function(backlogs, sprint) {
          var bgs = $scope.getBacklog(backlogs, sprint);
          var time = 0;
          for (var i = 0; i < bgs.length; i++) {
            for (var j = 0; j < bgs[i].tasks.length; j++) {
              time += bgs[i].tasks[j].compute_remaining;
            }
          }
          return time;
        };

        $scope.getSumTimeBacklog = function(backlogs, sprint) {
          var bgs = $scope.getBacklog(backlogs, sprint);
          var time = 0;
          for (var i = 0; i < bgs.length; i++) {
            time += bgs[i].hours;
          }
          return time;
        };

        $scope.getSumTimeBacklogCompleted = function(backlogs, sprint) {
          var bgs = $scope.getBacklogCompleted(backlogs, sprint);
          var time = 0;
          for (var i = 0; i < bgs.length; i++) {
            time += bgs[i].hours;
          }
          return time;
        };

        $scope.getSumTimeBacklogUncompleted = function(backlogs, sprint) {
          var bgs = $scope.getBacklogUncompleted(backlogs, sprint);
          var time = 0;
          for (var i = 0; i < bgs.length; i++) {
            time += bgs[i].hours;
          }
          return time;
        };

        $scope.getSumTimeTask = function(backlogs, sprint) {
          var bgs = $scope.getBacklog(backlogs, sprint);
          var time = 0;
          for (var i = 0; i < bgs.length; i++) {
            time += bgs[i].pestimate;
          }
          return time;
        };

        $scope.getDataTimeSprint = function(backlogs, sprint) {
          var time_sprint = sprint.time_hour;
          var time_backlog = $scope.getSumTimeBacklog(backlogs, sprint);
          var time_task = $scope.getSumTimeTask(backlogs, sprint);
          return [{
            'key': 'Series 1',
            'values': [
              ['Sprint', time_sprint],
              ['Backlog', time_backlog],
              ['Task', time_task],
            ]
          }];
        };

        $scope.getDataTimeBacklog = function(backlogs, sprint) {
          var time_complete = $scope.getSumTimeBacklogCompleted(backlogs, sprint);
          var time_uncomplete = $scope.getSumTimeBacklogUncompleted(backlogs, sprint);
          return [{
            key: 'Complete',
            y: time_complete
          }, {
            key: 'Uncomplete',
            y: time_uncomplete
          }];
        };

        $scope.getDataTimeTask = function(backlogs, sprint) {
          var time_uncomplete = $scope.getTimeTaskEstimate(backlogs, sprint);
          var time_complete = $scope.getTimeTaskComplete(backlogs, sprint);
          return [{
            key: 'Complete',
            y: time_complete
          }, {
            key: 'Uncomplete',
            y: time_uncomplete - time_complete
          }];
        };

        $scope.xFunction = function() {
          return function(d) {
            return d.key;
          };
        };

        $scope.yFunction = function() {
          return function(d) {
            return d.y;
          };
        };

      }]
    };
  }
]);
