'use strict';

//Meetings service used to communicate Meetings REST endpoints
angular.module('meetings').factory('Meetings', ['$resource',
	function($resource) {
		return $resource('meetings/:meetingId', { meetingId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);