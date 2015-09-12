'use strict';

//Backlogs service used to communicate Backlogs REST endpoints
angular.module('backlogs').factory('Backlogs', ['$resource',
  function($resource) {
    return $resource('projects/:projectId/backlogs/:backlogId', {
      backlogId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);
