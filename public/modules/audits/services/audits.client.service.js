'use strict';

//Audits service used to communicate Audits REST endpoints
angular.module('audits').factory('Audits', ['$resource',
	function($resource) {
		return $resource('audits/:auditId', { auditId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);