'use strict';

// Projects controller
angular.module('projects').controller('ProjectsController', ['$scope', '$stateParams', '$location', '$modal', 'Authentication', 'Projects', '$http', 'ProjectHelper', '$rootScope', '$state', 'Validator', '$timeout', 'socket', '$cookies',
  function($scope, $stateParams, $location, $modal, Authentication, Projects, $http, ProjectHelper, $rootScope, $state, Validator, $timeout, socket, $cookies) {
    $scope.authentication = Authentication;

    $scope.countProjects = function() {
      return ProjectHelper.countProject();
    };

    $rootScope.currentProjectId = '';

    var path = $location.path();
    var arrPath = path.split('/');
    var projectId = '';
    if (arrPath[1] !== undefined && arrPath[1] === 'projects' && arrPath[2] !== undefined && arrPath[2] !== $rootScope.currentProjectId.toString())
      $rootScope.currentProjectId = arrPath[2];

    $scope.find = function() {
      Projects.query(function(projects) {
        $scope.projects = projects;

        if ($rootScope.currentProjectId !== '') {
          var project = _.find(projects, {
            _id: $rootScope.currentProjectId
          });
          if (project !== undefined && $rootScope.currentProject === undefined) {
            $scope.projects.selected = project;
            $rootScope.currentProject = $scope.projects.selected;
          } else {
            if ($rootScope.currentProject !== undefined)
              project = _.find(projects, {
                _id: $rootScope.currentProject._id
              });
            if (project !== undefined) {
              $scope.projects.selected = project;
              $rootScope.currentProject = project;
              $rootScope.currentProjectId = project._id;
            } else if (projects[0] !== undefined) {
              $scope.projects.selected = projects[0];
              $rootScope.currentProject = projects[0];
              $rootScope.currentProjectId = projects[0]._id;
            } else {
              $rootScope.currentProjectId = '';
              $rootScope.currentProject = '';
              $state.go('listProjects');
            }
          }
        } else {
          var lastSelected = {};
          if($cookies.lastSelected){
            lastSelected = JSON.parse($cookies.lastSelected);
          }
          if (projects) {
            var result = _.find(projects, {
              _id: lastSelected._id
            });
            if (!!result) {
              $scope.projects.selected = lastSelected;
              $rootScope.currentProjectId = lastSelected._id;
              $rootScope.currentProject = lastSelected;
            } else {
              console.log(projects[0])
              $scope.projects.selected = projects[0];
              $rootScope.currentProject = projects[0];
              $rootScope.currentProjectId = projects[0]._id;
            }
          } else {
            $rootScope.currentProjectId = '';
            $rootScope.currentProject = undefined;
            $state.go('listProjects');
          }
        }
        $rootScope.$broadcast('rootScope:updateListProjects', projects);
      });
    };

    // Show existing Project
    $scope.show = function(projectId) {
      Projects.get({
        projectId: projectId
      }, function(project) {
        var modalInstance = $modal.open({
          templateUrl: 'modules/projects/views/shared/_project.modal.html',
          controller: 'ProjectModalController',
          controllerAs: 'project',
          backdrop: 'static',
          size: 'md',
          resolve: {
            project: function() {
              return project;
            },
            isNew: function() {
              return false;
            }
          }
        });
        modalInstance.result.then(function(project, msg) {
          $scope.find();
          // project.$promise.then(function(project) {
          //   if (msg === 'delete') {
          //     $rootScope.$broadcast('rootScope:deleteProject', project);
          //   }
          // });
        }, function(error) {
          console.log(error);
        });
      });
    };

    $scope.findOne = function() {
      Projects.get({
        projectId: $stateParams.projectId
      }, function(data) {
        $scope.project = data;
      }, function(err) {
        $state.go('listProjects');
      });
    };

    // Modal Project
    $scope.modalNew = function() {
      var modalInstance = $modal.open({
        templateUrl: 'modules/projects/views/shared/_project.modal.html',
        controller: 'ProjectModalController',
        controllerAs: 'project',
        backdrop: 'static',
        size: 'md',
        resolve: {
          project: function() {
            return {
              equivalent: 1
            };
          },
          isNew: function() {
            return true;
          }
        }
      });

      modalInstance.result.then(function(p, msg) {
        $scope.find();
        // $rootScope.$broadcast('rootScope:newProject', $scope.projects);
      }, function(error) {
        console.log(error);
      });
    };

    // $scope.getProjects = function(callback) {
    //   if (!Authentication.user)
    //     return;
    //   ProjectHelper.listProjects().then(function(payload) {
    //     $scope.listProjects = payload.data;
    //     var path = $location.path();
    //     var arrPath = path.split('/');
    //     var projectId = '';
    //     if (arrPath[1] !== undefined && arrPath[1] === 'projects' && arrPath[2] !== undefined)
    //       projectId = arrPath[2];

    //     if (projectId !== '') {
    //       $scope.listProjects.selected = _.find(payload.data, {
    //         _id: projectId
    //       });
    //       $rootScope.currentProject = $scope.listProjects.selected;
    //     } else {
    //       $scope.listProjects.selected = payload.data[0];
    //       $rootScope.currentProject = payload.data[0];
    //     }

    //     if (angular.isFunction(callback)) {
    //       callback();
    //     }
    //   }, function(err) {
    //     console.log(err);
    //   });
    // };

    $scope.selected = function($item) {
      $rootScope.currentProject = $item;
      var stateName = $state.$current.self.name;
      $rootScope.$broadcast('rootScope:currentProjectChanged', $item);
      if ($state.current.name === 'home') {
        $rootScope.$emit('rootScope:burndown');
        $rootScope.$broadcast('rootScope:updateListProjects');
      }
      $rootScope.currentProjectId = $item._id;
      $cookies.lastSelected = JSON.stringify($item);
    };

    $scope.$on('rootScope:currentProjectChanged', function(event, data) {
      if ($scope.projects !== undefined)
        $scope.projects.selected = data;
    });

    // $scope.$on('rootScope:newProject', function(event, resource) {
    //   resource.$promise.then(function(data) {
    //     if (!$rootScope.currentProject) {
    //       //for new user (first project)
    //       $scope.listProjects = data;
    //       $scope.selected(data[0]);
    //       $rootScope.currentProject = data[0];
    //     } else if ($scope.listProjects) {
    //       var selected = $scope.listProjects.selected;
    //       $scope.listProjects = data;
    //       $scope.listProjects.selected = selected;
    //     }
    //   });
    // });

    // $scope.$on('rootScope:deleteProject', function(event, project) {
    //   if ($scope.listProjects)
    //     for (var i in $scope.listProjects) {
    //       if ($scope.listProjects[i]._id == project._id) {

    //         $scope.listProjects.splice(i, 1);
    //         if ($scope.listProjects.length === 0) {
    //           $rootScope.currentProject = null;
    //           $scope.listProjects.selected = null;
    //         } else {
    //           $scope.selected($scope.listProjects[i]);
    //         }

    //         break;
    //       }
    //     }
    // });

    $scope.$on('rootScope:updateListProjects', function(event, projects) {
      projects.$promise.then(function(data) {
        $scope.projects = data;
      });
    });

    var join = false;
    $rootScope.$watch('currentProjectId', function(new_project, old_project) {
      if (new_project === old_project && !join) {
        socket.emit('joinProject', {
          projectId: new_project
        });
        join = true;
      }
      if (new_project !== undefined && new_project !== '' && new_project !== old_project) {
        socket.emit('joinProject', {
          projectId: new_project
        });
        var stateName = $state.$current.self.name;
        $state.go(stateName, {
          projectId: new_project
        });
      }
    });

    $scope.getBgClass = function($index) {
      if ($index % 3 === 0) {
        return 'blue';
      } else if ($index % 2 === 0) {
        return 'green';
      } else {
        return 'red';
      }
    };
  }
]);
