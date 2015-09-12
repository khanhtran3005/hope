'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Chat = mongoose.model('Chat'),
	Project = mongoose.model('Project'),
	Message = mongoose.model('Message'),
	_ = require('lodash'),
	async = require('async'),
	logger = require('bragi');

/**
 * Create a Chat
 */
exports.create = function(req, res) {
	var chat = new Chat(req.body);
	chat.user = req.user;
	chat.members.push(req.user._id);
	chat.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chat);
		}
	});
};

/**
 * Show the current Chat
 */
exports.read = function(req, res) {
	res.jsonp(req.chat);
};

/**
 * Update a Chat
 */
exports.update = function(req, res) {
	var chat = req.chat ;

	chat = _.extend(chat , req.body);

	chat.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chat);
		}
	});
};

/**
 * Delete an Chat
 */
exports.delete = function(req, res) {
	var chat = req.chat ;

	chat.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chat);
		}
	});
};

/**
 * List of Chats
 */
exports.list = function(req, res) { 
	Chat.find().sort('-created').populate('user', 'displayName').exec(function(err, chats) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(chats);
		}
	});
};

/**
 * Chat middleware
 */
exports.chatByID = function(req, res, next, id) { 
	Chat.findById(id).populate('user', 'displayName').exec(function(err, chat) {
		if (err) return next(err);
		if (! chat) return next(new Error('Failed to load Chat ' + id));
		req.chat = chat ;
		next();
	});
};

/**
 * Chat authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.chat.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};

exports.checkOngoingConf = function(req, res){
	var meetingId = req.param('meetingId');
	Chat.findOne({meeting: meetingId, status: 1}).select('_id').sort('-created').exec(function(err, chat){
		if(err)
			return res.status(500).send({
				message: errorHandler.getErrorMessage(err)
			});
		if(!chat)
			return res.status(204).jsonp({
				isExist: false
			});
		return res.status(200).jsonp({
			isExist: true,
			SDP: chat
		});
	});
};

exports.updateStatus = function(req, res){
	var roomId = req.param('chatId'),
		status = req.param('status');
	if(!roomId || !status)
		res.status(403).send();
	Chat.findById(roomId).exec(function(err, chat){
		chat.status = status;
		chat.save();
		res.status(200).send();
	});
};

exports.getFriendList = function(req, res){
	var user = req.user,
	userId = user._id;
	Project.find({people: userId}).populate('people', 'displayName username socketId attachment profileURL').exec(function(err, projects){
		
		var friendList = [];
		_.forEach(projects, function(project){
			_.forEach(project.people, function(friend){
				if(String(friend._id) !== String(userId)){
					friendList.push(friend);
				}
			});
		});
		friendList = _.uniq(friendList, 'displayName');

		var friendListWithLastMessage = [];

		async.each(friendList, function(friend, callback){
			Message.lastMessage(userId, friend._id, function(err, message){
				var index = _.findIndex(friendList, friend),
					obj;
				if(message.length > 0){
					obj = _.assign({lastMessage: message[0].message}, friendList[index]._doc);
				} else {
					obj = _.assign({lastMessage: '...'}, friendList[index]._doc);
				}
				obj.profileURL = friendList[index].profileURL;
				delete obj.attachment;
				friendListWithLastMessage.push(obj);
				
				callback();
			});
		}, function(err){
			if( err ) {
		      return logger.log('error', err);
		    } else {
		      return res.jsonp(friendListWithLastMessage);
		    }
		});

		
	});
};

exports.messages = function(req, res){
	var user = req.user,
		participant = req.param('userId');

	Message.getMessage(user._id, participant, function(err, messages){
		if(err){
			logger.log('error', err);
			return;
		}
		_.forEach(messages, function(message, index){
			delete messages[index].from.attachment;
			delete messages[index].to.attachment;
		});
		res.jsonp(messages);
	});
};

exports.addMessage = function(req, res){
	var message = new Message(req.body);
	message.from = req.user;

	message.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(message);
		}
	});
};

