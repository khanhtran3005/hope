'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var meetings = require('../../app/controllers/meetings.server.controller');

	// Meetings Routes
	app.route('/meetings/')
		.get(meetings.list)
		.post(users.requiresLogin, meetings.create);

	app.route('/meetings/ConfMessage/:meetingId/')
		.post(users.requiresLogin, meetings.updateConfMessage);
		
	app.route('/meetings/uploadVideos/:meetingId/')
		.put(users.requiresLogin, meetings.uploadVideos);
	app.route('/recorded/:recordedId')
		.delete(users.requiresLogin, meetings.isRecordedOwner, meetings.deleteRecorded);

	app.route('/meetings/:meetingId/')
		.get(meetings.read)
		.put(users.requiresLogin/*, meetings.hasAuthorization*/, meetings.update)
		.delete(users.requiresLogin/*, meetings.hasAuthorization*/, meetings.delete);
	app.route('/meetings/list/:projectId/project')
		.get(meetings.listByProjectId);

	app.route('/meetings/list/:srintId/sprint')
		.get(meetings.listBySprintId);

	// Finish by binding the Meeting middleware
	app.param('meetingId', meetings.meetingByID);
	app.param('recordedId', meetings.recordedByID);
};
