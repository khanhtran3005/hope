// 'use strict';

// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
//     Schema = mongoose.Schema,
//     relationship = require("mongoose-relationship");

// /**
//  * Meeting Schema
//  */
// var MeetingSchema = new Schema({
//     name: {
//         type: String,
//         default: '',
//         required: 'Please fill Meeting name',
//         trim: true
//     },
//     type: {
//         type: String,
//         required: true,
//         lowercase: true,
//         trim: true,
//         enum: [
//             'daily',
//             'sprint planning',
//             'backlog refinement',
//             'sprint review',
//             'sprint retrospective'
//         ]
//     },
//     sprint: {
//     	type: ObjectId,
//     	ref: 'Sprint',
//     	childPath:'children'
//     },
//     startDate: {
// 		type: Date,
// 		required: 'Please enter meeting start date.'
// 	},
// 	endDate: {
// 		type: Date,
// 		required: 'Please enter meeting end date.'
// 	},
//     created: {
//         type: Date,
//         default: Date.now
//     },
//     user: {
//         type: Schema.ObjectId,
//         ref: 'User'
//     }
// });

// MeetingSchema.plugin(relationship, { relationshipPathName:'parent' });
// var Child = mongoose.models("Child", ChildSchema)

// mongoose.model('Meeting', MeetingSchema);
