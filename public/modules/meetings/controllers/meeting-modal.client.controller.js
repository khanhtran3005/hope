'use strict';

angular.module('meetings').controller('MeetingModalController', ['$scope', '$stateParams', '$location', '$modalInstance', 'Authentication', 'Meetings', 'SprintHelper', '$rootScope', 'event', 'isNew', 'Sprints',
  function($scope, $stateParams, $location, $modalInstance, Authentication, Meetings, SprintHelper, $rootScope, event, isNew, Sprints) {
    $scope.meeting = {};
    $scope.event = {}; //for update new meeting (dont know why cannot use $scope.meeting, may be use 
    $scope.isAllDay = false;
    $scope.dateFormat = 'MMM DD, YYYY @ h:mm a';
    $scope.types = [{
        value: 'normal',
        display: 'Normal'
      }, {
        value: 'daily',
        display: 'Daily meeting'
      }, {
        value: 'sprint planning',
        display: 'Sprint planning meeting'
      }, {
        value: 'backlog refinement',
        display: 'Backlog refinement meeting'
      }, {
        value: 'sprint review',
        display: 'Sprint review meeting'
      }, {
        value: 'sprint retrospective',
        display: 'Sprint retrospective meeting'
      }

    ];
    $scope.types.selected = {
      value: 'normal',
      display: 'Normal'
    }; //dafaul value
    $scope.listSprints = [];
    $scope.listSprints.selected = {};
    $scope.isNew = isNew;
    if (!isNew) {
      $scope.event = event;
      $scope.event.startDate = new Date(event.startDate);
      for (var key in $scope.types) {
        if ($scope.types[key].value === event.type) {
          $scope.types.selected = $scope.types[key];
          break;
        }
      }

    }

    $scope.cancel = function() {
      $scope.meeting = {};
      $modalInstance.dismiss('cancel');
    };

    $scope.loadSprints = function() {
      Sprints.query({
        projectId: $stateParams.projectId
      }, function(res) {
        console.log(res);
        $scope.listSprints = res;
        if (angular.isDefined(res[0])) {
          if (isNew)
            $scope.listSprints.selected = res[0];
          else {
            $scope.listSprints.selected = _.find($scope.listSprints, function(sprint){
              return sprint._id === $scope.event.sprint._id;
            });
          }
        } else {
          $scope.listSprints.selected = {};
        }
      });
    };

    $scope.create = function() {
      // Create new Meeting object
      var meeting = new Meetings({
        name: $scope.meeting.name,
        type: $scope.types.selected.value,
        sprintId: $scope.listSprints.selected._id,
        startDate: moment($scope.meeting.startDate),
        isAllDay: $scope.meeting.isAllDay
      });
      // if(!meeting.isAllDay){
      if (angular.isDate($scope.meeting.endDate))
        meeting.endDate = $scope.meeting.endDate;
      // }

      // Redirect after save
      meeting.$save(function(res) {
        console.log(res);
        // $location.path('meetings/' + response._id);
        $scope.types.selected = {
          value: 'normal',
          display: 'Normal'
        }; //dafaul value
        $scope.meeting = {};
        $modalInstance.close(res);

      }, function(err) {
        console.log(err);
      });
    };

    // Update existing Meeting
    $scope.update = function() {
      var meeting = $scope.event;
      meeting.type = $scope.types.selected.value;
      meeting.startDate = moment($scope.event.startDate);
      meeting.sprint = $scope.listSprints.selected._id;
      meeting.isAllDay = $scope.event.isAllDay;
      console.log(meeting.sprint = $scope.listSprints.selected._id);


      meeting.$update(function(res) {
        console.log(res);
        $modalInstance.close(res);
      }, function(err) {
        console.log(err);
      });
    };

    $scope.remove = function() {
      var meeting = $scope.event;
      meeting.$remove(function(res) {
        res.deleted = true;
        $modalInstance.close(res);
      });
    };



    $scope.$watch('meeting.isAllDay', function(newVal, oldVal) {
      if (newVal) {
        $scope.dateFormat = 'MMM DD, YYYY';
      } else {
        $scope.dateFormat = 'MMM DD, YYYY h:mm a';
      }
    });
    $scope.$watch('event.isAllDay', function(newVal, oldVal) {
      if (newVal) {
        $scope.dateFormat = 'MMM DD, YYYY';
      } else {
        $scope.dateFormat = 'MMM DD, YYYY h:mm a';
      }
    });
  }
]);
