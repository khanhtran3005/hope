'use strict';

// Teams controller
angular.module('teams').controller('TeamsController', ['$scope', '$rootScope', '$state', '$http', '$stateParams', '$location', 'Authentication', 'Teams', 'Users', '$timeout', '$window', '$modal',
  function($scope, $rootScope, $state, $http, $stateParams, $location, Authentication, Teams, Users, $timeout, $window, $modal) {
    $scope.authentication = Authentication;

    if ($rootScope.currentProjectId === '' || $rootScope.currentProjectId === undefined || $rootScope.currentProjectId === null) $state.go('listProjects');

    $scope.devTeamFocus = null;
    $scope.teams = [];
    $scope.devTeams = [];
    $scope.productOwner = {
      people: []
    };
    $scope.stackholder = {
      people: []
    };
    $scope.scrumMaster = {
      people: []
    };
    $scope.project_member = {
      people: []
    };
    $scope.listFreeMember = {
      members: []
    };

    $scope.alertMe = function() {
      setTimeout(function() {
        $window.alert('You\'ve selected the alert tab!');
      });
    };

    // Limit items to be dropped in product_owner
    $scope.optionProductOwner = {
      accept: function(dragEl) {
        if ($scope.productOwner.people.length > 1) {
          return false;
        } else {
          return true;
        }
      }
    };

    // Limit items to be dropped in product_owner
    $scope.optionScrumMaster = {
      accept: function(dragEl) {
        if ($scope.scrumMaster.people.length > 1) {
          return false;
        } else {
          return true;
        }
      }
    };

    // Limit items to be dropped in stackholder
    $scope.optionStackHolder = {
      accept: function(dragEl) {
        if ($scope.stackholder.people.length > 3) {
          return false;
        } else {
          return true;
        }
      }
    };

    $scope.startCallback = function(event, ui, member) {
      $scope.draggedMember = member;
    };

    $scope.dropCallback = function(event, ui, team) {
      remove_null_member();
      addMember($stateParams.projectId, team._id, $scope.draggedMember._id);
    };

    $scope.dropRemoveTeamMember = function(event, ui) {
      remove_null_member();
      removeTeamMember($stateParams.projectId, $scope.draggedMember._id);
    };

    // Limit items to be dropped in team
    $scope.optionTeamPeople = {};

    $scope.modalNew = function() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/teams/views/shared/_team.modal.html',
        controller: 'TeamModalController',
        controllerAs: 'team',
        backdrop: 'static',
        // size: 'lg',
        resolve: {
          team: function() {
            return {};
          },
          project: function() {
            return $scope.project;
          },
          isNew: function() {
            return true;
          }
        }
      });

      modalInstance.result.then(function(result, team) {
        $scope.find();
      }, function(error) {
        console.log(error);
      });
    };

    $scope.modalEdit = function(team) {
      if ($scope.devTeamFocus !== undefined) {
        var modalInstance = $modal.open({
          templateUrl: 'modules/teams/views/shared/_team.modal.html',
          controller: 'TeamModalController',
          controllerAs: 'team',
          backdrop: 'static',
          // size: 'lg',
          resolve: {
            team: function() {
              return $scope.devTeamFocus;
            },
            project: function() {
              return $scope.project;
            },
            isNew: function() {
              return false;
            }
          }
        });

        modalInstance.result.then(function(result, team) {
          $scope.find();
        }, function(error) {
          console.log(error);
        });
      }
    };

    $scope.focusDevTeam = function(team) {
      $scope.devTeamFocus = team;
    };

    // $scope.deleteTeam = function() {
    //   if ($scope.devTeamFocus !== undefined && $scope.devTeamFocus !== null) {
    //     $scope.devTeamFocus.$remove({
    //       projectId: $stateParams.projectId
    //     }, function() {
    //       $scope.devTeamFocus = null;
    //       $scope.find();
    //     });
    //   }
    // };

    // Find a list of Teams
    $scope.find = function() {
      Teams.query({
        projectId: $stateParams.projectId
      }, function(teams) {
        $scope.teams = teams;
        slice_team(teams);
        remove_null_member();
        if ($scope.devTeamFocus === null || $scope.devTeamFocus === undefined) {
          $scope.devTeamFocus = $scope.devTeams[0];
        }
      });
    };

    $scope.freeMembers = function(keyword) {
      if (keyword !== '') {
        var params = {
          keyword: keyword
        };
        $http.get(
          '/projects/' + $stateParams.projectId + '/free_members', {
            params: params
          }
        ).success(function(members) {
          $scope.listFreeMember = members;
        });
      } else {
        $scope.listFreeMember = {
          members: []
        };
      }
    };

    $scope.addMemberToProject = function(member) {
      if (member !== '') {
        $http.post(
          '/projects/' + $stateParams.projectId + '/free_members', {
            memberId: member._id
          }
        ).success(function(members) {
          $scope.find();
        });
      }
    };

    function slice_team(teams) {
      $scope.devTeams = [];
      for (var i = 0; i < teams.length; i++) {
        switch (teams[i].team_type) {
          case 'product_owner':
            {
              $scope.productOwner = teams[i];
            }
            break;
          case 'stackholder':
            {
              $scope.stackholder = teams[i];
            }
            break;
          case 'dev_team':
            {
              $scope.devTeams.push(teams[i]);
            }
            break;
          case 'scrum_master':
            {
              $scope.scrumMaster = teams[i];
            }
            break;
          case 'project_member':
            {
              $scope.project_member = teams[i];
            }
            break;
        }
      }
    }

    function remove_null_member() {
      for (var i = 0; i < $scope.scrumMaster.people.length; i++) {
        if ($scope.scrumMaster.people[i]._id === undefined) {
          $scope.scrumMaster.people.splice(i, 1);
        }
      }
      for (var j = 0; j < $scope.stackholder.people.length; j++) {
        if ($scope.stackholder.people[j]._id === undefined) {
          $scope.stackholder.people.splice(j, 1);
        }
      }
      for (var k = 0; k < $scope.productOwner.people.length; k++) {
        if ($scope.productOwner.people[k]._id === undefined) {
          $scope.productOwner.people.splice(k, 1);
        }
      }
      for (var m = 0; m < $scope.devTeams.length; m++) {
        for (var n = 0; n < $scope.devTeams[m].people.length; n++) {
          if ($scope.devTeams[m].people[n]._id === undefined) {
            $scope.devTeams[m].people.splice(n, 1);
          }
        }
      }
      for (var l = 0; l < $scope.project_member.people.length; l++) {
        if ($scope.project_member.people[l]._id === undefined) {
          $scope.project_member.people.splice(l, 1);
        }
      }
    }

    function addMember(projectId, teamId, memberId) {
      $http.post('projects/' + projectId + '/teams/' + teamId + '/member', {
        memberId: memberId
      }).success(function(teams, status) {
        $scope.teams = teams;
      }).error(function(teams, status) {
        $scope.find();
      });
    }

    function removeTeamMember(projectId, memberId) {
      $http.post('projects/' + projectId + '/members/remove_team', {
        memberId: memberId
      }).success(function(teams, status) {
        $scope.teams = teams;
      }).error(function(teams, status) {
        $scope.find();
      });
    }
  }
]);
