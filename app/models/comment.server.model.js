'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  timestamps = require('mongoose-timestamp'),
  Schema = mongoose.Schema;

/**
 * Comment Schema
 */
var CommentSchema = new Schema({
  content: {
    type: String,
    default: '',
    required: 'Please fill content',
    trim: true
  },
  tbl: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: [
      'project',
      'sprint',
      'backlog',
      'task',
      'resource'
    ]
  },
  tbl_id: {
    type: Schema.ObjectId,
    required: true,
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

CommentSchema.plugin(timestamps);
mongoose.model('Comment', CommentSchema);
