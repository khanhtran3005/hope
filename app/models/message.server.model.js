'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Message Schema
 */
var MessageSchema = new Schema({
	message: {
		type: String,
		required: 'Please input for messages'
	},
	from: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Who is the sender?'
	},
	to: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Who is the reciever?'
	},
	created: {
		type: Date,
		default: Date.now
	}
});

MessageSchema.statics.getMessage = function(from, to, cb){
	this.find({
		$or: [{
			$and: [{from: from}, {to: to}]
		}, {
			$and: [{from: to}, {to: from}]
		}]
	}).populate('from', 'displayName attachment profileURL').populate('to', 'displayName attachment profileURL').exec(cb);

};

MessageSchema.statics.lastMessage = function(from, to ,cb){
	this.find({
		$or: [{
			$and: [{from: from}, {to: to}]
		}, {
			$and: [{from: to}, {to: from}]
		}]
	}).sort('-created').limit(1).exec(cb);
};

mongoose.model('Message', MessageSchema);