'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	relationship = require('mongoose-relationship');

/**
 * Chat Schema
 */
var ChatSchema = new Schema({
	name: {
		type: String,
		default: '',
		trim: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	},
	members: [{
		type: Schema.ObjectId,
		ref: 'User'
	}],
	meeting: {
		type: Schema.ObjectId,
    	ref: 'Meeting',
    	required: 'This conference must belong to a meeting/event',
    	childPath: 'conferences'
	},
	status: {
		type: Number,
		/**
		 * 1: ongoing
		 * 2: closed
		 */
		enum: [1,2], 
		default: 1
	}
});
ChatSchema.plugin(relationship, { relationshipPathName:'meeting' });
mongoose.model('Chat', ChatSchema);