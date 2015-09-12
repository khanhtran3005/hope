'use strict';

//Setting up route
angular.module('resources').config(['$stateProvider',
	function($stateProvider) {
		// Resources state routing
		$stateProvider.
		state('listResources', {
			url: '/resources',
			templateUrl: 'modules/resources/views/list-resources.client.view.html'
		});
	}
]);