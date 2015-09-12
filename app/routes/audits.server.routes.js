'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var audits = require('../../app/controllers/audits.server.controller');

	// Audits Routes
	app.route('/audits')
		.get(audits.list);

	app.route('/audits/:auditId')
		.get(audits.read);

	// Finish by binding the Audit middleware
	app.param('auditId', audits.auditByID);
};
