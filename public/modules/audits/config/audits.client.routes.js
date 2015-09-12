'use strict';

//Setting up route
angular.module('audits').config(['$stateProvider',
  function($stateProvider) {
    // Audits state routing
    $stateProvider.
    state('listAudits', {
      url: '/audits',
      templateUrl: 'modules/audits/views/list-audits.client.view.html'
    });
  }
]);
