'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$rootScope', 'toaster', 'SprintHelper', '$timeout', 'Sprints', '$location',

  function($scope, Authentication, $rootScope, toaster, SprintHelper, $timeout, Sprints, $location) {
    // This provides Authentication context.
    $scope.authentication = Authentication;
    $rootScope.projectLoaded = false;
    // $rootScope.$watch('currentProject', function(newVal, oldVal){
    //     if(!$rootScope.projectLoaded){
    //         console.log($rootScope.currentProject);
    //         $rootScope.projectLoaded = true;
    //     }
    // });

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams) {
        //inject current project to all request
        if ($rootScope.currentProject)
          toParams.currentProject = $rootScope.currentProject._id;

      });
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {

      });
    $rootScope.user = user;

    $scope.toast = function() {
      $rootScope.$broadcast('rootScope:toaster');
    };

    $scope.config = {
      visible: true,
      autorefresh: true
    };

    $scope.options = {
      chart: {
        type: 'lineChart',
        height: 400,
        margin: {
          top: 20,
          right: 20,
          bottom: 40,
          left: 55
        },
        x: function(d) {
          return d.x;
        },
        y: function(d) {
          return d.y;
        },
        useInteractiveGuideline: true,
        dispatch: {
          stateChange: function(e) {
            console.log('stateChange');
          },
          changeState: function(e) {
            console.log('changeState');
          },
          tooltipShow: function(e) {
            console.log('tooltipShow');
          },
          tooltipHide: function(e) {
            console.log('tooltipHide');
          }
        },
        xAxis: {
          axisLabel: 'Sprint Dates'
        },
        yAxis: {
          axisLabel: 'Remaining points',
          tickFormat: function(d) {
            return d3.format('.02f')(d);
          },
          axisLabelDistance: 30
        },
        callback: function(chart) {
          // console.log('!!! lineChart callback !!!');
        }
      }

    };

    $scope.data = [];
    burndown();
    $rootScope.$on('rootScope:burndown', function(event, data) {
      burndown();
    });


    $scope.sprints = [];
    $scope.burndown = function() {
      burndown($scope.listSprints.selected._id);
    };

    /*Random Data Generator */
    function burndown(sprintId) {
      if (!$rootScope.currentProject)
        return;
      SprintHelper.burndown($rootScope.currentProject._id, sprintId).then(function(data) {
        $scope.sprints = data.data;
        _.forEach($scope.sprints, function(sprint, i) {
          var ideal = [],
            remaining = [],
            duration = 0,
            total = sprint.total,
            burndownLength = sprint.burndown.length;

          duration = dateDiff(sprint.endDate, sprint.startDate);

          for (var index = 0; index <= duration; index++) {
            ideal.push({
              x: index,
              y: Math.floor((total - total / duration * index) * 10) / 10
            });
            // console.log(sprint.burndown[index])
            var y = 0;
            if (index < burndownLength)
              y = total - sprint.burndown[index].done;

            remaining.push({
              x: index,
              y: y
            });

          }

          var data = [{
            values: remaining,
            key: 'Remaining',
            color: '#ff7f0e',
            area: true
          }, {
            values: ideal,
            key: 'Ideal',
            color: '#7777ff'
          }];
          $scope.sprints[i].data = data;
        });
      });
    }

    function dateDiff(startDate, endDate) {
      var oneDay = 1000 * 60 * 60 * 24,
        first = new Date(startDate),
        last = new Date(endDate);

      return Math.ceil((first.getTime() - last.getTime()) / oneDay);
    }

    $scope.loadSprints = function() {
      if (!$rootScope.currentProject)
        $scope.$on('rootScope:updateListProjects', function() {
          loadSprints();
          //draw burndown chart when user access to the dashboard
          if ($location.path() === '/') {
            burndown();
          }
        });
      else
        loadSprints();

    };

    function loadSprints() {
      Sprints.query({
        projectId: $rootScope.currentProject._id
      }, function(res) {
        $scope.listSprints = res;
      });
    }

  }
]);
