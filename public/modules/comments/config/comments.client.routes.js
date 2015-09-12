'use strict';

//Setting up route
angular.module('comments').config(['$stateProvider',
	function($stateProvider) {
		// Comments state routing
		$stateProvider.
		state('listComments', {
			url: '/comments',
			templateUrl: 'modules/comments/views/list-comments.client.view.html'
		});
	}
]);