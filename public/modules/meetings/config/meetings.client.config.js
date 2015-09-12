'use strict';

// Configuring the Articles module
angular.module('meetings').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('meeting', 'Meetings', 'meetings', 'dropdown', '/meetings(/create)?');
		// Menus.addSubMenuItem('meeting', 'meetings', 'List Meetings', 'meetings');
		// Menus.addSubMenuItem('meeting', 'meetings', 'New Meeting', 'meetings/create');
	}
]);