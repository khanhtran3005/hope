'use strict';

angular.module('projects').factory('ProjectHelper', ['$http', '$rootScope', 'Validator',
  function($http, $rootScope, Validator) {
    // ProjectHelper service logic
    // ...

    // Public API
    return {
      countProject: function() {
        // return 0;
        return $http.get('/projects/total');
      },
      listProjects: function() {
        return $http.get('/projects');
      },
      getCurrentProject: function(callback) {
        // $rootScope.$on('$viewContentLoaded', function() {
        if (Validator.isUndefinedKey($rootScope, 'currentProject')) {
          this.listProjects().then(function(payload) {
            $rootScope.currentProject = payload.data[0];
            if (angular.isFunction(callback)) {
              callback();
            }
          }, function(err) {
            console.log(err);
          });
        } else {
          if (angular.isFunction(callback)) {
            callback();
          } else {
            alert('Callback must be a function');
          }
        }
        // });

      }
    };
  }
]);
