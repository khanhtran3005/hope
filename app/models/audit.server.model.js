'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  config = require('../../config/config'),
  nodemailer = require('nodemailer'),
  path = require('path'),
  templatesDir = path.resolve(__dirname, '../views/mailers'),
  emailTemplates = require('email-templates'),
  User = mongoose.model('User'),
  logger = require('bragi'),
  Schema = mongoose.Schema;

var EmailAddressRequiredError = new Error('Email address required');

/**
 * Audit Schema
 */
var AuditSchema = new Schema({
  tbl: {
    type: String,
    required: 'Recipient type is required',
    trim: true
  },
  tbl_id: {
    type: String,
    required: 'Recipient id is required',
    trim: true
  },
  messages: [{
    type: String,
    default: '',
    trim: true
  }],
  receivers: [{
    type: Schema.ObjectId,
    trim: true,
    ref: 'User'
  }],
  readers: [{
    type: Schema.ObjectId,
    trim: true,
    ref: 'User'
  }],
  user: {
    type: Schema.ObjectId,
    trim: true,
    ref: 'User'
  },
  created: {
    type: Date,
    default: Date.now
  },
  last_ip_at: {
    type: String,
    trim: true
  }
});

AuditSchema.statics.createAudit = function createAudit(table, table_id, creator, messages, ip, receivers) {
  var readers = [];
  var new_receivers = [];
  if (!!receivers) {
    for (var i = 0; i < receivers.length; i++) {
      if (typeof receivers[i] === 'object' && receivers[i]._id !== undefined) {
        new_receivers.push(receivers[i]._id);
      } else {
        if (!!receivers[i])
          new_receivers.push(receivers[i]);
      }
    }
    receivers = new_receivers;
  }
  if (!receivers) {
    receivers = [];
  }
  if (!!creator) {
    if (receivers.length === 0) {
      receivers = [creator];
      readers = [creator];
    }
  }
  if (!!creator && typeof creator === 'object' && creator._id !== undefined) {
    creator = creator._id;
  }
  logger.log('receivers', receivers);
  var transportBatch = nodemailer.createTransport(config.mailer.options);
  Audit.create({
    tbl: table,
    tbl_id: table_id,
    user: creator,
    messages: messages,
    last_ip_at: ip,
    receivers: receivers,
    readers: readers
  }, function(err, audit) {
    if (err) console.log(err);
    else {
      audit.populate('user', function(err3, audit) {
        if (err3) {
          console.log(err3);
        } else {
          emailTemplates(templatesDir, function(err, template) {
            if (err) {
              console.log(err);
            } else {
              template('notifications', audit, function(err2, html, text) {
                if (err2) {
                  console.log(err2);
                } else {
                  User.find({
                    '_id': {
                      $in: receivers
                    }
                  }, function(err1, users) {
                    if (err1) {
                      console.log(err1);
                    } else {
                      var emails = [];
                      for (var i = 0; i < users.length; i++) {
                        emails.push(users[i].email);
                      }
                      if (emails.length > 0) {
                        transportBatch.sendMail({
                          from: config.mailer.from,
                          bcc: emails,
                          subject: audit.messages[0],
                          html: html,
                          text: text
                        }, function(err, responseStatus) {
                          if (err) {
                            console.log(err);
                          } else {
                            console.log(responseStatus);
                          }
                        });
                      }
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};
var Audit = mongoose.model('Audit', AuditSchema);
module.exports = mongoose.model('Audit');
