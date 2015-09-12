'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Audit Schema
 */
var BurndownSchema = new Schema({
  sprint: {
    type: Schema.ObjectId,
    ref: 'Sprint',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  total: {
    type: Number,
    default: 0
  },
  done: {
    type: Number,
    default: 0
  }


});

var Audit = mongoose.model('Burndown', BurndownSchema);
module.exports = mongoose.model('Burndown');
