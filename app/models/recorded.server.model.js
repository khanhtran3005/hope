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
var RecordedSchema = new Schema({
	title: {
		type: String,
		default: '',
		trim: true
	},
	URL: {
		type: String,
		default: '',
		trim: true,
		required: 'Recorded video URL is required'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: true
	},
	created: {
		type: Date,
		default: Date.now
	},
	meeting: {
		type: Schema.ObjectId,
		ref: 'Meeting',
		childPath:'recordedVideos',
		required: true
	},
	
});
RecordedSchema.plugin(relationship, { relationshipPathName:'meeting' });
mongoose.model('Recorded', RecordedSchema);