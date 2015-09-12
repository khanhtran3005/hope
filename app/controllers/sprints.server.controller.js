'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Sprint = mongoose.model('Sprint'),
  validator = require('validator'),
  logger = require('bragi'),
  _ = require('lodash');

// var rule = new schedule.RecurrenceRule();
// rule.minute = 1;
// var j = schedule.scheduleJob(rule, function(){
//     console.log('The answer to life, the universe, and everything!');
// });

/**
 * Create a Sprint
 */
exports.create = function(req, res) {
  var sprint = new Sprint(req.body),
    projectId = req.param('projectId') || '';
  if (projectId === '')
    return res.send(403, {
      message: 'projectId is required.'
    });

  sprint.user = req.user;
  sprint.projectId = projectId;
  sprint.actor = req.user;
  sprint.action_ip = req.ip;
  var inOtherSprint = false;
  Sprint.find({
    deleted: false
  }).select('name startDate endDate').exec(function(err, sprints) {
    for (var i = 0; i < sprints.length; i++) {
      var newStartDate = sprint.startDate.getTime(),
        newEndDate = sprint.endDate.getTime(),
        curStartDate = sprints[i].startDate.getTime(),
        curEndDate = sprints[i].endDate.getTime();
      if ((newStartDate >= curStartDate && newStartDate <= curEndDate) ||
        (newEndDate >= curStartDate && newEndDate <= curEndDate)) {
        inOtherSprint = true;
        res.status(400).send({
          message: 'This Sprint duration is in Sprint "' + sprints[i].name + '"'
        });
        break;
      }
    }

    if (!inOtherSprint) {
      sprint.save(function(err) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.jsonp(sprint);
        }
      });
    }

  });
};

/**
 * Show the current Sprint
 */
exports.read = function(req, res) {
  res.jsonp(req.sprint);
};

/**
 * Update a Sprint
 */
exports.update = function(req, res) {
  var sprint = req.sprint;

  sprint = _.extend(sprint, req.body);
  sprint.actor = req.user;
  sprint.action_ip = req.ip;

  sprint.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(sprint);
    }
  });
};

/**
 * Delete an Sprint
 */
exports.delete = function(req, res) {
  var sprint = req.sprint;
  sprint.actor = req.user;
  sprint.action_ip = req.ip;

  sprint.delete(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(sprint);
    }
  });
};

/**
 * List of Sprints
 */
exports.list = function(req, res) {
  var projectId = req.param('projectId');
  // logger.log('info', projectId);

  if (validator.isAlphanumeric(projectId)) {
    Sprint.find({
        projectId: projectId,
        deleted: {
          $ne: true
        }
      })
      .populate('user', 'displayName')
      .sort({
        'startDate': 'asc'
      })
      .exec(function(err, sprints) {
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          var today = new Date();
          sprints.forEach(function(sprint, index) {
            var sprintEndDate = new Date(sprint.endDate);
            if (today > sprintEndDate) {
              sprints.splice(index, 1);
              sprints.push(sprint);
            }
          });

          res.jsonp(sprints);
        }
      });
  } else {
    return res.status(400).send({
      message: 'project ID is required'
    });
  }

};

/**
 * Sprint middleware
 */
exports.sprintByID = function(req, res, next, id) {
  Sprint.findOne({
    _id: id,
    deleted: {
      $ne: true
    }
  }).populate('user', 'displayName').exec(function(err, sprint) {
    if (err) return next(err);
    if (!sprint) return next(new Error('Failed to load Sprint ' + id));
    req.sprint = sprint;
    next();
  });
};

/**
 * Sprint authorization middleware
 */
exports.hasAuthorizationSprintRead = function(req, res, next) {
  if (req.user_team === undefined) {
    return res.status(403).send({
      message: 'Sprint: You don\'t have permission to access Sprint\'s information.'
    });
  } else {
    next();
  }
  // next();
};

exports.hasAuthorizationSprintFull = function(req, res, next) {
  if (req.user_team === undefined) {
    return res.status(403).send({
      message: 'Sprint: You don\'t have permission to do this action!'
    });
  } else {
    if (req.user_team.team_type !== 'scrum_master' && req.user_team.team_type !== 'product_owner') {
      return res.status(403).send({
        message: 'Sprint: Only Product Owner and Scrum Master can do this action!'
      });
    }
    next();
  }
  // next();
};

exports.burndown = function(req, res) {
  var projectId = req.param('projectId'),
    sprintId = req.param('sprintId');

  if (!sprintId) {
    var today = new Date();
    Sprint.findOne({
      projectId: projectId,
      startDate: {
        $lt: today
      },
      endDate: {
        $gt: today
      },
      deleted: {
        $ne: true
      }
    }).exec(function(err, sprint) {
      if (err)
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      if (!sprint) {
        return res.status(400).send({
          message: 'There is no activing sprint in this project'
        });
      }
      logger.log('sprint', sprint);
      Sprint.burndown(sprint._id, function(err, burndownData) {
        if (err)
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        res.jsonp(burndownData);
      });
    });
  } else {

    Sprint.burndown(sprintId, function(err, burndownData) {
      if (err)
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      res.jsonp(burndownData);
    });
  }


};
