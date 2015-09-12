'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
  errorHandler = require('../errors'),
  mongoose = require('mongoose'),
  passport = require('passport'),
  User = mongoose.model('User');

/**
 * Update user details
 */
exports.update = function(req, res) {
  // Init Variables
  var user = req.user;
  var message = null;

  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;
  delete req.body.username;
  
  if (user) {
    // Merge existing user
    user = _.extend(user, req.body);
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        req.login(user, function(err) {
          if (err) {
            res.status(400).send(err);
          } else {
            res.jsonp(user);
          }
        });
      }
    });
  } else {
    res.status(400).send({
      message: 'User is not signed in'
    });
  }
};

/**
 * Send User
 */
exports.me = function(req, res) {
  res.jsonp(req.user || null);
};

exports.updateprofile = function(req, res) {
  var user = req.user;

  if (user) {
    user.attach('attachment', req.files.attachment, function(err1) {
      if (err1) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err1)
        });
      } else {
        user.save(function(err, user) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.jsonp(user);
          }
        });
      }
    });
  }
};
