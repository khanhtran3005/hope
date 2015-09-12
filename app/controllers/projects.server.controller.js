'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Project = mongoose.model('Project'),
  Team = mongoose.model('Team'),
  User = mongoose.model('User'),
  Backlog = mongoose.model('Backlog'),
  Sprint = mongoose.model('Sprint'),
  Task = mongoose.model('Task'),
  Team = mongoose.model('Team'),
  config = require('../../config/config'),
  nodemailer = require('nodemailer'),
  _ = require('lodash');

/**
 * Create a Project
 */
exports.create = function(req, res) {
  var project = new Project(req.body);
  project.user = req.user;
  project.actor = req.user;
  project.action_ip = req.ip;
  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Show the current Project
 */
exports.read = function(req, res) {
  res.jsonp(req.project);
};

/**
 * Update a Project
 */
exports.update = function(req, res) {
  var project = req.project;

  project = _.extend(project, req.body);
  project.backlogs = _.uniq(req.body.backlogs);
  project.actor = req.user;
  project.action_ip = req.ip;

  project.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * Delete an Project
 */
exports.delete = function(req, res) {
  var project = req.project;

  project.actor = req.user;
  project.action_ip = req.ip;

  project.delete(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  });
};

/**
 * List of Projects
 */
exports.list = function(req, res) {
  Project.find({
    people: {
      $in: [req.user._id]
    },
    deleted: {
      $ne: true
    }
  }).sort('-created').populate('people').exec(function(err, projects) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(projects);
    }
  });
};

exports.projectByUserID = function(req, res, next) {
  var userId = req.user.id;
  Project.find({
    'people': userId,
    deleted: {
      $ne: true
    }
  }).populate('people', 'displayName').exec(function(err, projects) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(projects);
    }
  });
};

exports.countProjectOfUser = function(req, res, next) {
  var userId = req.user.id;
  Project.find({
    'people': userId,
    deleted: {
      $ne: true
    }
  }).count(function(err, total) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        total: total
      });
    }
  });
};

exports.getMembers = function(req, res, next) {
  Project.findOne({
    _id: req.project._id,
    deleted: {
      $ne: true
    }
  }, function(err3, project) {
    if (err3) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err3)
      });
    } else {
      var invite_members = _.uniq(project.invite_members);
      var people = _.uniq(project.people);
      User.find({
        _id: {
          $in: people
        }
      }).select('displayName profileURL email skype facebook phone title desc attachment').exec(function(err, pp) {
        var members = [];
        if (err) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          if (pp === undefined) pp = [];
          for (var i = 0; i < pp.length; i++) {
            pp[i].accept = true;
            members.push(pp[i]);
          }
          var im_ids = [];
          for (var m = 0; m < invite_members.length; m++) {
            var check = false;
            for (var n = 0; n < people.length; n++) {
              if (invite_members[m].user.toString() === people[n].toString()) {
                check = true;
                break;
              }
            }
            if (!check)
              im_ids.push(invite_members[m].user.toString());
          }
          User.find({
            _id: {
              $in: im_ids
            }
          }).select('displayName profileURL email skype facebook phone title desc attachment').exec(function(err1, ims) {
            if (err1) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err1)
              });
            } else {
              if (ims === undefined) ims = [];
              for (var j = 0; j < ims.length; j++) {
                ims[j].accept = false;
                members.push(ims[j]);
              }
              res.jsonp(members);
            }
          });
        }
      });
    }
  });
};

exports.getPublicMembers = function(req, res, next) {
  Project.findOne({
    _id: req.project._id,
    deleted: {
      $ne: true
    }
  }, function(err, project) {
    var invite_members = project.invite_members;
    var people = project.people;
    for (var i = 0; i < invite_members.length; i++) {
      people.push(invite_members[i].user.toString());
    }
    User.find({
      _id: {
        $not: {
          $in: people
        }
      },
      user_public: {
        $eq: true
      }
    }).limit(5).select('displayName email').exec(function(err, users) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(users);
      }
    });
  });
};

exports.getFreeMembers = function(req, res, next) {
  req.project.getFreeMembers(req.query.keyword, function(err, members) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp({
        members: members
      });
    }
  });
};

exports.inviteMember = function(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.body.memberId)) {
    return res.status(400).send({
      message: 'Key and memberId are required!'
    });
  }
  var data = {
    user: req.body.memberId,
    key: Math.random().toString(36).slice(2)
  };
  var project = req.project;
  var invite_members = project.invite_members;
  var people = project.people;
  var exist = false;
  var host = req.get('host');
  for (var j = 0; j < people.length; j++) {
    if (people[j].toString() === req.body.memberId.toString()) {
      exist = true;
      break;
    }
  }
  if (exist) {
    return res.status(400).send({
      message: 'This user was in project'
    });
  } else {
    User.findById(data.user, function(err1, user) {
      if (err1) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err1)
        });
      } else {
        invite_members.push(data);
        project.invite_members = invite_members;
        project.save(function(err) {
          if (err) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err)
            });
          } else {
            res.render('templates/confirm-invite-member-email', {
              project: req.project.name,
              memberId: data.user,
              key: data.key,
              user: user,
              url: 'http://' + host.toString() + '/projects/' + req.project._id + '/invite_members?key=' + data.key + '&memberId=' + data.user
            }, function(err2, emailHTML) {
              var smtpTransport = nodemailer.createTransport(config.mailer.options);
              var mailOptions = {
                to: user.email,
                from: config.mailer.from,
                subject: 'Invite to project "' + req.project.name + '"',
                html: emailHTML
              };
              smtpTransport.sendMail(mailOptions, function(err3) {
                if (err3) {
                  console.log(err3);
                }
              });
            });
            res.jsonp({
              message: 'Confirm successfully!'
            });
          }
        });
      }
    });
  }
};

exports.addFreeMember = function(req, res, next) {
  var key = req.body.key;
  var host = req.get('host');
  var memberId = req.body.memberId;
  if (key === undefined) key = req.param('key');
  if (memberId === undefined) memberId = req.param('memberId');
  // var user = req.user._id;
  if (key === undefined || !mongoose.Types.ObjectId.isValid(memberId)) {
    return res.status(400).send({
      message: 'Key and memberId are required!'
    });
  } else {
    Project.find({
      _id: req.project._id,
      'invite_members.user': mongoose.Types.ObjectId(memberId.toString()),
      'invite_members.key': key,
      deleted: {
        $ne: true
      }
    }, function(err, project) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        if (project === undefined || project.length === 0) {
          return res.status(400).send({
            message: 'Can\'t find invitation in this project or this project was deleted!'
          });
        } else {
          req.project.addMemberToProject(memberId, function(err) {
            if (err) {
              return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
              });
            } else {
              for (var i = 0; i < req.project.invite_members.length; i++) {
                if (req.project.invite_members[i].user.toString() === memberId) {
                  req.project.invite_members[i].remove();
                }
              }
              req.project.save(function(err3, p) {
                if (err) {
                  return res.status(400).send({
                    message: errorHandler.getErrorMessage(err3)
                  });
                } else {
                  res.redirect('/');
                }
              });
            }
          }, '', req.ip);
        }
      }
    });
  }
};

exports.removeFreeMember = function(req, res, next) {
  var memberId = req.params.memberId;
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res.status(400).send({
      message: 'MemberId !!!'
    });
  }
  req.project.removeMember(memberId, function(err, project) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  }, req.user, req.ip);
};

exports.removeInviteMember = function(req, res, next) {
  var memberId = req.params.memberId;
  if (!mongoose.Types.ObjectId.isValid(memberId)) {
    return res.status(400).send({
      message: 'MemberId !!!'
    });
  }
  req.project.removeInvite(memberId, function(err, project) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(project);
    }
  }, req.user, req.ip);
};


/**
 * Report
 */
exports.report = function(req, res) {
  var project = req.project;
  User.findById(req.params.memberId, function(err6, user) {
    if (err6) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err6)
      });
    } else {
      if (!user) {
        return res.status(400).send({
          message: 'User isn\'t find!'
        });
      }
      Team.findOne({
        project: req.project._id,
        people: {
          $in: [user.id]
        }
      }, function(err4, team) {
        if (err4) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err4)
          });
        } else {
          if (team) {
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
                for (var m = 0; m < backlogs.length; m++) {
                  var tasks = [];
                  for (var n = 0; n < backlogs[m].tasks.length; n++) {
                    if (backlogs[m].tasks[n].assignee && backlogs[m].tasks[n].assignee.toString() === req.params.memberId.toString()) {
                      tasks.push(backlogs[m].tasks[n]);
                    }
                  }
                  backlogs[m].tasks = tasks;
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
                      user: user,
                      team: team,
                      sprints: sprints,
                      backlogs: backlogs
                    });
                  }
                });
              }
            });
          } else {
            res.jsonp({
              project: project,
              user: user,
              team: null,
              sprints: [],
              backlogs: []
            });
          }
        }
      });
    }
  });
};


/**
 * Project middleware
 */
exports.projectByID = function(req, res, next, id) {
  Project.findOne({
    _id: id,
    deleted: {
      $ne: true
    }
  }).populate('people', 'displayName').populate('teams', 'type name').exec(function(err, project) {
    if (err) return next(err);
    if (!project) return next(new Error('Failed to load Project ' + id));
    req.project = project;
    next();
  });
};


/**
 * Project authorization middleware
 */
exports.hasAuthorizationProjectRead = function(req, res, next) {
  var people = req.project.people;
  var exist = false;
  for (var i = 0; i < people.length; i++) {
    if (people[i]._id.toString() === req.user.id.toString()) {
      exist = true;
      break;
    }
  }
  if (exist) {
    Team.find({
      project: req.project.id,
      people: {
        $in: [req.user.id]
      }
    }, function(err, teams) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        if (teams.length === 0) {
          req.user_team = undefined;
          next();
        } else {
          var team = teams[0];
          req.user_team = team;
          next();
        }
      }
    });
  } else {
    return res.status(403).send({
      message: 'Project: You can\'t access to this project!'
    });
  }
};

exports.hasAuthorizationFull = function(req, res, next) {
  Team.find({
    project: req.project.id,
    people: {
      $in: [req.user.id]
    }
  }, function(err, teams) {
    if (teams.length === 0) {
      return res.status(403).send({
        message: 'Project: You don\'t have permission to do this action!'
      });
    } else {
      var team = teams[0];
      req.user_team = team;
      if (team.team_type !== 'product_owner' && team.team_type !== 'scrum_master') {
        return res.status(403).send({
          message: 'Project: Only product owner and scrum master can do this action!'
        });
      } else {
        next();
      }
    }
  });
  // next();
};
