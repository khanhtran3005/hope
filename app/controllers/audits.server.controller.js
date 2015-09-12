'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Audit = mongoose.model('Audit'),
  Backlog = mongoose.model('Backlog'),
  _ = require('lodash');

/**
 * Create a Audit
 */
exports.create = function(req, res) {
  var audit = new Audit(req.body);
  audit.user = req.user;

  audit.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(audit);
    }
  });
};

/**
 * Show the current Audit
 */
exports.read = function(req, res) {
  res.jsonp(req.audit);
};

/**
 * Update a Audit
 */
exports.update = function(req, res) {
  var audit = req.audit;

  audit = _.extend(audit, req.body);

  audit.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(audit);
    }
  });
};

/**
 * Delete an Audit
 */
exports.delete = function(req, res) {
  var audit = req.audit;

  audit.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(audit);
    }
  });
};

/**
 * List of Audits
 */
exports.list = function(req, res) {
  var table = req.param('tbl');
  var id = req.param('tbl_id');
  if (!table || !id) { //table and id is required
    return res.jsonp([]);
  }
  switch (table) {
    case 'backlog':
      Backlog.findById(id, function(err, backlog) {
        if (err) {
          return res.jsonp([]);
        } else {
          if (backlog === null) {
            return res.jsonp([]);
          } else {
            var ids = backlog.tasks;
            ids.push(id);
            Audit.find({
              tbl_id: {
                $in: ids
              }
            }).sort('-created').populate('user', 'displayName').exec(function(err3, audits) {
              if (err3) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err3)
                });
              } else {
                res.jsonp(audits);
              }
            });
          }
        }
      });
      break;
    case 'sprint':
      Backlog.find({
        sprint: id
      }, function(err, backlogs) {
        if (err) {
          return res.jsonp([]);
        } else {
          var ids = [];
          for (var i = 0; i < backlogs.length; i++) {
            ids.push(backlogs[i]._id);
          }
          ids.push(id);
          Audit.find({
            tbl_id: {
              $in: ids
            }
          }).sort('-created').populate('user', 'displayName').exec(function(err3, audits) {
            if (err3) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err3)
              });
            } else {
              res.jsonp(audits);
            }
          });
        }
      });
      break;
    default:
      Audit.find({
        tbl: table,
        tbl_id: id
      }).sort('-created').populate('user', 'displayName').exec(function(err3, audits) {
        if (err3) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err3)
          });
        } else {
          res.jsonp(audits);
        }
      });
      break;
  }
};

/**
 * Audit middleware
 */
exports.auditByID = function(req, res, next, id) {
  Audit.findById(id).populate('user', 'displayName').exec(function(err, audit) {
    if (err) return next(err);
    if (!audit) return next(new Error('Failed to load Audit ' + id));
    req.audit = audit;
    next();
  });
};

/**
 * Audit authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.audit.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
