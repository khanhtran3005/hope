'use strict';

//Setting up route
angular.module('teams').config(['$stateProvider',
  function($stateProvider) {
    // Teams state routing
    $stateProvider.
    state('viewProject.teams', {
      url: '/teams',
      templateUrl: 'modules/teams/views/list-teams.client.view.html'
    }).
    state('viewProject.report', {
      url: '/report',
      templateUrl: 'modules/teams/views/report.client.view.html'
    });
  }
]);
