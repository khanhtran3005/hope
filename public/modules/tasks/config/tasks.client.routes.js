'use strict';

//Setting up route
angular.module('tasks').config(['$stateProvider',
	function($stateProvider) {
		// Tasks state routing
		$stateProvider.
		state('viewProject.tasks', {
			url: '/tasks',
			templateUrl: 'modules/tasks/views/list-tasks.client.view.html'
		});
	}
]);