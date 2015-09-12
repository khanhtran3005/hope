'use strict';

angular.module('projects').controller('EmployeesController', ['$rootScope', '$state', '$scope', '$stateParams', '$location', 'Authentication', 'Projects', '$http',
  function($rootScope, $state, $scope, $stateParams, $location, Authentication, Projects, $http) {

    if ($rootScope.currentProjectId === '' || $rootScope.currentProjectId === undefined || $rootScope.currentProjectId === null) $state.go('listProjects');

    $scope.find = function() {
      $http.get(
        '/projects/' + $stateParams.projectId + '/members'
      ).success(function(members) {
        $scope.members = members;
      }).error(function() {
        $state.go('listProjects');
      });
    };

    $scope.listPublicMember = function() {
      $http.get(
        '/projects/' + $stateParams.projectId + '/public_members'
      ).success(function(members) {
        $scope.public_members = members;
      }).error(function() {
        $state.go('listProjects');
      });
    };

    $scope.freeMembers = function(keyword) {
      if (keyword !== '' && keyword.length > 1) {
        var params = {
          keyword: keyword
        };
        $http.get(
          '/projects/' + $stateParams.projectId + '/free_members', {
            params: params
          }
        ).success(function(members) {
          $scope.listFreeMember = members;
        }).error(function() {
          $scope.listFreeMember = {
            members: []
          };
        });
      } else {
        $scope.listFreeMember = {
          members: []
        };
      }
    };

    $scope.inviteMember = function(member) {
      if (member !== '') {
        $http.post(
          '/projects/' + $stateParams.projectId + '/invite_members', {
            memberId: member._id
          }
        ).success(function(members) {
          $scope.listPublicMember();
          $scope.listFreeMember = [];
          $scope.keyword = '';
        });
      }
    };

    $scope.deleteInviteMember = function(member) {
      if (member !== '') {
        $http.delete(
          '/projects/' + $stateParams.projectId + '/invite_members/' + member._id, {
            memberId: member._id
          }
        ).success(function(data) {
          $scope.find();
        });
      }
    };

    $scope.deleteMember = function(member) {
      console.log(member);
      if (member !== '') {
        $http.delete(
          '/projects/' + $stateParams.projectId + '/free_members/' + member._id, {
            memberId: member._id
          }
        ).success(function(data) {
          $scope.find();
        });
      }
    };

  }
]);
