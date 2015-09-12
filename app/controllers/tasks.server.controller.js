'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Task = mongoose.model('Task'),
  _ = require('lodash');

/**
 * Create a Task
 */
exports.create = function(req, res) {
  if (req.body.assignee === 'delete') {
    delete req.body.assignee;
  }
  var task = new Task(req.body);
  task.user = req.user;
  task.actor = req.user;
  task.action_ip = req.ip;
  task.backlog = req.backlog;
  task.project = req.project;
  task.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(task);
    }
  });
};

/**
 * Show the current Task
 */
exports.read = function(req, res) {
  res.jsonp(req.task);
};

/**
 * Update a Task
 */
exports.update = function(req, res) {
  delete req.body.backlog;
  var task = req.task;
  var assignee = req.body.assignee;
  if (assignee === 'delete') {
    delete req.body.assignee;
    task.assignee = undefined;
  }
  task = _.extend(task, req.body);
  task.actor = req.user;
  task.action_ip = req.ip;
  task.save(function(err) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(task);
    }
  });
};

/**
 * Delete an Task
 */
exports.delete = function(req, res) {
  var task = req.task;
  task.actor = req.user;
  task.action_ip = req.ip;
  task.delete(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(task);
    }
  });
};

/**
 * List of Tasks
 */
exports.list = function(req, res) {
  Task.find({
    backlog: req.backlog._id,
    deleted: {
      $ne: true
    }
  }).sort('-created').populate('user', 'displayName').populate('assignee', 'displayName').exec(function(err, tasks) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(tasks);
    }
  });
};

/**
 * Task middleware
 */
exports.taskByID = function(req, res, next, id) {
  Task.findOne({
    _id: id,
    deleted: {
      $ne: true
    }
  }).populate('user', 'displayName').populate('assignee', 'people').populate('backlog').exec(function(err, task) {
    if (err) return next(err);
    if (!task) return next(new Error('Failed to load Task ' + id));
    Task.populate(task, {
      path: 'backlog.assignee',
      model: 'Team'
    }, function(err1, task1) {
      req.task = task1;
      next();
    });

  });
};

/**
 * Task authorization middleware
 */
exports.hasAuthorizationTaskRead = function(req, res, next) {
  if (req.user_team === undefined) {
    return res.status(403).send({
      message: 'Task: You don\'t have permission to access!'
    });
  } else {
    next();
  }
  // next();
};

exports.hasAuthorizationTaskFull = function(req, res, next) {
  if (req.user_team === undefined) {
    return res.status(403).send({
      message: 'Task: You don\'t have permission to do this action!'
    });
  } else {
    req.backlog.populate('assignee', function(err, backlog) {
      if (backlog.assignee === undefined) {
        return res.status(403).send({
          message: 'Task: This backlog isn\'t assigned to anyone!'
        });
      } else {
        if (req.user_team.team_type !== 'dev_team') {
          return res.status(403).send({
            message: 'Task: Only Development team do this action!'
          });
        } else {
          var people = backlog.assignee.people;
          var exist = false;
          for (var i = 0; i < people.length; i++) {
            if (people[i].toString() === req.user._id.toString()) {
              exist = true;
              break;
            }
          }
          if (exist) {
            next();
          } else {
            return res.status(403).send({
              message: 'Task: You\'re not in this team!'
            });
          }
        }
      }
    });
  }
  // next();
};

/**
 * Task prefix middleware
 */
exports.prefixTask = function(req, res, next) {
  var task = req.body;
  if (task.assignee !== undefined && task.assignee !== null) {
    if (task.assignee.constructor.name.toString() === 'Object') {
      if (task.assignee._id !== undefined) {
        req.body.assignee = task.assignee._id;
      }
    }
  }
  next();
};
