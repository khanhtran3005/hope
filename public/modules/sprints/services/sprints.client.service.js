'use strict';

//Sprints service used to communicate Sprints REST endpoints
angular.module('sprints').factory('Sprints', ['$resource',
  function($resource) {
    return $resource('projects/:projectId/sprints/:sprintId', {
      sprintId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
