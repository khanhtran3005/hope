'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var chats = require('../../app/controllers/chats.server.controller');

	// Chats Routes
	app.route('/chats')
		.get(chats.list)
		.post(users.requiresLogin, chats.create);
		
	app.route('/chats/friendlist')
		.get(users.requiresLogin, chats.getFriendList);

	app.route('/chats/messages')
		.post(users.requiresLogin, chats.addMessage);

	app.route('/chats/messages/:userId')
		.get(users.requiresLogin, chats.messages);

	app.route('/chats/meeting/:meetingId')
		.get(users.requiresLogin, chats.checkOngoingConf);

	app.route('/chats/:chatId')
		.get(chats.read)
		.put(users.requiresLogin, chats.hasAuthorization, chats.update)
		.delete(users.requiresLogin, chats.hasAuthorization, chats.delete);

	app.route('/chats/:chatId/:status')
		.put(users.requiresLogin, chats.updateStatus);

	// Finish by binding the Chat middleware
	app.param('chatId', chats.chatByID);
};
