'use strict';

//Setting up route
angular.module('backlogs').config(['$stateProvider',
  function($stateProvider) {
    // Backlogs state routing
    $stateProvider.
    state('viewProject.backlogs', {
      url: '/backlogs',
      templateUrl: 'modules/backlogs/views/list-backlogs.client.view.html'
    }).
    state('viewProject.kanban', {
      url: '/kanban',
      templateUrl: 'modules/backlogs/views/kanban-backlogs.client.view.html'
    });
  }
]);
