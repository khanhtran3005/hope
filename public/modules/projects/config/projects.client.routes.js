'use strict';

//Setting up route
angular.module('projects').config(['$stateProvider',
  function($stateProvider) {
    // Projects state routing
    $stateProvider.
    state('listProjects', {
      url: '/projects',
      templateUrl: 'modules/projects/views/list-projects.client.view.html'
    }).
    state('viewProject', {
      url: '/projects/:projectId',
      templateUrl: 'modules/projects/views/view-project.client.view.html'
    }).
    state('viewProject.contacts', {
      url: '/contacts',
      templateUrl: 'modules/projects/views/contacts.client.view.html'
    }).
    state('viewProject.member_report', {
      url: '/members/:userId/report',
      templateUrl: 'modules/projects/views/report-member.client.view.html'
    }).
    state('employees', {
      url: '/projects/:projectId/employees',
      templateUrl: 'modules/projects/views/employees.client.view.html'
    });
  }
]);
