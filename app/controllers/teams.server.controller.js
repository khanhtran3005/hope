'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Team = mongoose.model('Team'),
  Project = mongoose.model('Project'),
  Backlog = mongoose.model('Backlog'),
  Sprint = mongoose.model('Sprint'),
  _ = require('lodash');

/**
 * Create a Team
 */
exports.create = function(req, res) {
  var team = new Team(req.body);
  team.user = req.user;
  team.project = req.project;
  team.team_type = 'dev_team';
  team.actor = req.user;
  team.action_ip = req.ip;
  team.locked = false;

  team.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(team);
    }
  });
};

/**
 * Show the current Team
 */
exports.read = function(req, res) {
  res.jsonp(req.team);
};

/**
 * Update a Team
 */
exports.update = function(req, res) {
  var team = req.team;
  team.team_type = 'dev_team';
  team.locked = false;
  team = _.extend(team, req.body);
  team.actor = req.user;
  team.action_ip = req.ip;

  team.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(team);
    }
  });
};

/**
 * Delete an Team
 */
exports.delete = function(req, res) {
  var team = req.team;
  team.actor = req.user;
  team.action_ip = req.ip;

  team.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(team);
    }
  });
};

exports.list = function(req, res) {
  Team.findByProjectAndMember({
    project: req.project._id
  }, function(err, teams) {
    if (err) {
      console.log(err);
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      teams[0].people = _.uniq(teams[0].people, 'displayName');
      res.jsonp(teams);
    }
  });
};


/**
 * List develop teams
 */
exports.developTeam = function(req, res) {
  Team.findByProjectAndMember({
    project: req.project._id,
    team_type: 'dev_team'
  }, function(err, teams) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      teams.shift();
      res.jsonp(teams);
    }
  });
};

/**
 * List dev teams
 */
exports.removeTeamMember = function(req, res) {
  var project = req.project;
  project.removeTeamMember(req.body.memberId, function(err, team) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      exports.list(req, res);
    }
  }, req.user, req.ip);
};


/**
 * Add member to team
 */
exports.addMember = function(req, res) {
  var project = req.project;
  project.addMember(req.team._id, req.body.memberId, function(err, team) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      exports.list(req, res);
    }
  }, req.user, req.ip);
};

/**
 * Report
 */
exports.report = function(req, res) {
  var project = req.project;
  var team = req.team;
  Backlog.findByProjectAndEstimate({
    project: req.project._id,
    assignee: team._id,
    deleted: {
      $ne: true
    }
  }, function(err, backlogs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var sprint_ids = [];
      for (var i = 0; i < backlogs.length; i++) {
        if (backlogs[i].sprint !== undefined && backlogs[i].sprint !== null && backlogs[i].sprint._id !== null && backlogs[i].sprint._id !== null)
          sprint_ids.push(backlogs[i].sprint._id);
      }
      Sprint.find({
        _id: {
          $in: sprint_ids
        },
        deleted: {
          $ne: true
        }
      }).sort({
        'startDate': 'asc'
      }).exec(function(err1, sprints) {
        if (err1) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err1)
          });
        } else {
          res.jsonp({
            project: project,
            team: team,
            sprints: sprints,
            backlogs: backlogs
          });
        }
      });
    }
  });
};

/**
 * Team middleware
 */
exports.teamByID = function(req, res, next, id) {
  Team.findById(id).populate('people').populate('user', '_id displayName').exec(function(err, team) {
    if (err) return next(err);
    if (!team) return next(new Error('Failed to load Team ' + id));
    req.team = team;
    next();
  });
};

/**
 * Team authorization middleware
 */
exports.hasAuthorizationTeamRead = function(req, res, next) {
  next();
};

exports.hasAuthorizationTeamFull = function(req, res, next) {
  if (req.user._id.toString() === req.project.user.toString()) {
    next();
  } else {
    if (req.user_team === undefined) {
      return res.status(403).send({
        message: 'Team: You don\'t have permission to do this action!'
      });
    } else {
      if (req.user_team.team_type !== 'scrum_master' && req.user_team.team_type !== 'dev_team') {
        return res.status(403).send({
          message: 'Team: Only Scrum Master and Project\'s creator can do this action!'
        });
      } else {
        next();
      }
    }
  }
};
