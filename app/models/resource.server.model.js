'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  crate = require('mongoose-crate'),
  LocalFS = require('mongoose-crate-localfs'),
  path = require('path');


/**
 * Resource Schema
 */
var ResourceSchema = new Schema({
  tbl: {
    type: String,
    // required: true,
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
    // required: true,
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

ResourceSchema.set('toJSON', {
  virtuals: true
});

ResourceSchema.methods.toJSON = function() {
  var obj = this.toObject();
  var attachment = obj.attachment;
  if (this.attachment.name !== undefined && this.attachment.size !== undefined && this.attachment.type !== undefined) {
    obj.rsId = this.attachment.name;
    obj.name = this.attachment.name;
    obj.size = this.attachment.size;
    obj.type = this.attachment.type;
    obj.url = '/uploads/' + this.attachment.name;
    delete obj.attachment;
  }
  return obj;
};

ResourceSchema.plugin(crate, {
  storage: new LocalFS({
    directory: path.resolve(__dirname, '../../public/uploads')
  }),
  fields: {
    attachment: {}
  }
});

mongoose.model('Resource', ResourceSchema);
