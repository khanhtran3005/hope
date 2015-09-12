'use strict';

// Configuring the Articles module
angular.module('sprints').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		// Menus.addMenuItem('Sprint', 'Sprints', 'sprints', 'dropdown', '/sprints(/create)?');
		// Menus.addSubMenuItem('Sprint', 'sprints', 'List Sprints', 'sprints');
		// Menus.addSubMenuItem('Sprint', 'sprints', 'New Sprint', 'sprints/create');
	}
]);