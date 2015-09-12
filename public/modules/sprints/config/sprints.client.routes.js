'use strict';

//Setting up route
angular.module('sprints').config(['$stateProvider',
	function($stateProvider) {
		// Sprints state routing
		$stateProvider.
		state('viewProject.listSprints', {
			url: '/sprints',
			templateUrl: 'modules/sprints/views/list-sprints.client.view.html'
		}).
		state('viewProject.createSprint', {
			url: '/sprints/create',
			templateUrl: 'modules/sprints/views/create-sprint.client.view.html'
		}).
		state('viewProject.viewSprint', {
			url: '/sprints/:sprintId',
			templateUrl: 'modules/sprints/views/view-sprint.client.view.html'
		}).
		state('viewProject.editSprint', {
			url: '/sprints/:sprintId/edit',
			templateUrl: 'modules/sprints/views/edit-sprint.client.view.html'
		});
	}
]);