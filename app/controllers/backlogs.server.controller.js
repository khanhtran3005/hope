'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Backlog = mongoose.model('Backlog'),
  Audit = mongoose.model('Audit'),
  Sprint = mongoose.model('Sprint'),
  _ = require('lodash');

/**
 * Create a Backlog
 */
exports.create = function(req, res) {
  delete req.body.accept;
  var assignee = req.body.assignee;
  if (assignee === 'deleted') {
    delete req.body.assignee;
  }
  var backlog = new Backlog(req.body);
  backlog.user = req.user;
  backlog.project = req.project;
  backlog.actor = req.user;
  backlog.action_ip = req.ip;
  if (backlog.backlog_status !== 'Sprint') {
    backlog.sprint = undefined;
  }
  if (req.body.assignee === 'deleted') {
    backlog.assignee = undefined;
  }
  backlog.save(function(err, bl) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      backlog.populate({
        path: 'user',
        select: 'firstName'
      }, function(err, doc) {
        res.json(doc);
      });
    }
  });
};

/**
 * Show the current Backlog
 */
exports.read = function(req, res) {
  res.jsonp(req.backlog);
};

/**
 * Update a Backlog
 */
exports.update = function(req, res) {
  delete req.body.accept;
  delete req.body.sprint;
  delete req.body.user;
  delete req.body.tasks;
  delete req.body.project;
  var backlog = req.backlog;
  var assignee = req.body.assignee;
  if (assignee === 'deleted') {
    delete req.body.assignee;
  }
  backlog = _.extend(backlog, req.body);
  backlog.actor = req.user;
  backlog.action_ip = req.ip;
  if (backlog.backlog_status !== 'Sprint') {
    backlog.sprint = undefined;
  }
  if (assignee === 'deleted') {
    backlog.assignee = undefined;
  }
  backlog.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var backlog_ids = req.body.backlog_ids;
      if (backlog_ids !== undefined) {
        req.project.update({
          backlogs: backlog_ids
        }, function(err1, project) {
          if (err1) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err1)
            });
          } else {
            backlog.populate({
              path: 'user',
              select: 'firstName'
            }, function(err2, doc) {
              if (err2) {
                return res.status(400).send({
                  message: errorHandler.getErrorMessage(err2)
                });
              } else {
                res.json(doc);
              }
            });
          }
        });
      } else {
        backlog.populate({
          path: 'user',
          select: 'firstName'
        }, function(err3, doc) {
          if (err3) {
            return res.status(400).send({
              message: errorHandler.getErrorMessage(err3)
            });
          } else {
            res.json(doc);
          }
        });
      }
    }
  });
};

/**
 * Delete an Backlog
 */
exports.delete = function(req, res) {
  var backlog = req.backlog;
  backlog.actor = req.user;
  backlog.action_ip = req.ip;

  backlog.delete(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      backlog.populate({
        path: 'user',
        select: 'firstName'
      }, function(err, doc) {
        res.json(doc);
      });
    }
  });
};

/**
 * List of Backlogs
 */
exports.list = function(req, res) {
  Backlog.findByProjectAndEstimate({
    project: req.project._id,
    deleted: {
      $ne: true
    }
  }, function(err, backlogs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var sort_backlogs = [];
      var project_backlogs = req.project.backlogs;
      for (var i = 0; i < project_backlogs.length; i++) {
        for (var j = 0; j < backlogs.length; j++) {
          if (backlogs[j]._id.toString() === project_backlogs[i].toString()) {
            sort_backlogs.push(backlogs[j]);
          }
        }
      }
      for (var m = 0; m < backlogs.length; m++) {
        var exist = false;
        for (var n = 0; n < sort_backlogs.length; n++) {
          if (sort_backlogs[n]._id.toString() === backlogs[m]._id.toString()) {
            exist = true;
            break;
          }
        }
        if (!exist) {
          sort_backlogs.push(backlogs[m]);
        }
      }
      res.jsonp(sort_backlogs);
    }
  });
};

/**
 * List of Backlogs without sprint
 */
exports.backlogWithoutSprint = function(req, res) {
  Backlog.findByProjectAndEstimate({
    project: req.project._id,
    sprint: {
      $exists: false
    },
    deleted: {
      $ne: true
    },
    backlog_status: 'Sprint'
  }, function(err, backlogs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var sort_backlogs = [];
      var project_backlogs = req.project.backlogs;
      for (var i = 0; i < project_backlogs.length; i++) {
        for (var j = 0; j < backlogs.length; j++) {
          if (backlogs[j]._id.toString() === project_backlogs[i].toString()) {
            sort_backlogs.push(backlogs[j]);
          }
        }
      }
      for (var m = 0; m < backlogs.length; m++) {
        var exist = false;
        for (var n = 0; n < sort_backlogs.length; n++) {
          if (sort_backlogs[n]._id.toString() === backlogs[m]._id.toString()) {
            exist = true;
            break;
          }
        }
        if (!exist) {
          sort_backlogs.push(backlogs[m]);
        }
      }
      res.jsonp(sort_backlogs);
    }
  });
};

/**
 * List of Backlogs with sprint
 */
// exports.backlogWithSprint = function(req, res) {
//   Backlog.findByProjectAndEstimate({
//     project: req.project._id,
//     sprint: req.sprint._id,
//     deleted: {
//       $ne: true
//     }
//   }, function(err, backlogs) {
//     if (err) {
//       return res.status(400).send({
//         message: errorHandler.getErrorMessage(err)
//       });
//     } else {
//       var sort_backlogs = [];
//       var sprint_backlogs = req.sprint.backlogs;
//       for (var i = 0; i < sprint_backlogs.length; i++) {
//         for (var j = 0; j < backlogs.length; j++) {
//           if (backlogs[j]._id.toString() === sprint_backlogs[i].toString()) {
//             sort_backlogs.push(backlogs[j]);
//           }
//         }
//       }
//       for (var m = 0; m < backlogs.length; m++) {
//         var exist = false;
//         for (var n = 0; n < sort_backlogs.length; n++) {
//           if (sort_backlogs[n]._id.toString() === backlogs[m]._id.toString()) {
//             exist = true;
//             break;
//           }
//         }
//         if (!exist) {
//           sort_backlogs.push(backlogs[m]);
//         }
//       }
//       res.jsonp(sort_backlogs);
//     }
//   });
// };


/**
 * List of Backlogs with sprint
 */
exports.backlogWithSprint = function(req, res) {
  Backlog.findByProjectAndEstimate({
    project: req.project._id,
    sprint: req.sprint._id,
    deleted: {
      $ne: true
    }
  }, function(err, backlogs) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var sort_backlogs = [];
      var sprint_backlogs = req.project.backlogs;
      for (var i = 0; i < sprint_backlogs.length; i++) {
        for (var j = 0; j < backlogs.length; j++) {
          if (backlogs[j]._id.toString() === sprint_backlogs[i].toString()) {
            sort_backlogs.push(backlogs[j]);
          }
        }
      }
      for (var m = 0; m < backlogs.length; m++) {
        var exist = false;
        for (var n = 0; n < sort_backlogs.length; n++) {
          if (sort_backlogs[n]._id.toString() === backlogs[m]._id.toString()) {
            exist = true;
            break;
          }
        }
        if (!exist) {
          sort_backlogs.push(backlogs[m]);
        }
      }
      res.jsonp(sort_backlogs);
    }
  });
};

/**
 * Remove backlog from sprint
 */
exports.backlogRemoveFormSprint = function(req, res) {
  var team = req.body.team;
  if (team !== undefined && team !== 'deleted' && !mongoose.Types.ObjectId.isValid(team)) {
    return res.status(400).send({
      message: 'Team is\'t found!'
    });
  }
  if (team === 'deleted') {
    req.backlog.assignee = undefined;
  } else {
    req.backlog.assignee = team;
  }
  req.backlog.sprint = undefined;
  req.backlog.actor = req.user;
  req.backlog.action_ip = req.ip;
  req.backlog.save(function(err, backlog) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.backlog.populate('assignee', function(err3, backlog) {
        var messages = ['Removed backlog "' + req.backlog.name + '"" from sprint'];
        if (err3) {
          Audit.createAudit('backlog', req.backlog._id, req.user._id, messages, req.ip, []);
        } else {
          if (backlog.assignee !== null && backlog.assignee !== undefined) {
            Audit.createAudit('backlog', req.backlog._id, req.user._id, messages, req.ip, backlog.assignee.people);
          }
        }
      });
      exports.backlogWithoutSprint(req, res);
    }
  });
};

/**
 * Add backlog to sprint
 */
exports.backlogAddToSprint = function(req, res) {
  var team = req.body.team;
  if (team !== undefined && team !== 'deleted' && !mongoose.Types.ObjectId.isValid(team)) {
    return res.status(400).send({
      message: 'Team is\'t found!'
    });
  }
  if ((req.backlog.assignee === null || req.backlog.assignee === undefined) && team === undefined) {
    return res.status(400).send({
      message: 'Backlog: This backlog isn\'t assigned to anyone!'
    });
  } else {
    if (team === 'deleted') {
      req.backlog.assignee = undefined;
    } else {
      req.backlog.assignee = team;
    }
    req.backlog.sprint = req.sprint._id;
    req.backlog.actor = req.user;
    req.backlog.action_ip = req.ip;
    req.backlog.save(function(err2, backlog) {
      if (err2) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err2)
        });
      } else {
        exports.backlogWithSprint(req, res);
      }
    });
  }
};

/**
 * Accept backlog
 */
exports.backlogAccept = function(req, res) {
  var accept = req.body.accept;
  if (req.user_team.team_type === 'product_owner') {
    if (accept === undefined) {
      exports.list(req, res);
    } else {
      req.backlog.update({
        accept: accept
      }, function(err2) {
        if (err2) {
          return res.status(400).send({
            message: errorHandler.getErrorMessage(err2)
          });
        } else {
          req.backlog.populate('assignee', function(err3, backlog) {
            if (!err3 && backlog.assignee !== null && backlog.assignee !== undefined) {
              var messages = ['Backlog "' + req.backlog.name + '"'];
              if (accept) {
                messages.push('Finished');
              } else {
                messages.push('Switch from finished to not finish');
              }
              Audit.createAudit('backlog', req.backlog._id, req.user._id, messages, req.ip, backlog.assignee.people);
            }
          });
          exports.list(req, res);
        }
      });
    }
  } else {
    return res.status(403).send({
      message: 'Backlog: You don\'t have permission to do this action!'
    });
  }
};

exports.orderBacklog = function(req, res, next) {
  var backlog_ids = req.body.backlog_ids;
  if (backlog_ids !== undefined) {
    req.project.update({
      backlogs: backlog_ids
    }, function(err, project) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        exports.list(req, res);
      }
    });
  } else {
    return res.status(400).send({
      message: errorHandler.getErrorMessage('List backlog is required!')
    });
  }
};


/**
 * Backlog middleware
 */
exports.backlogByID = function(req, res, next, id) {
  Backlog.findByIdAndEstimate({
    _id: id,
    deleted: {
      $ne: true
    }
  }, function(err, backlog) {
    if (err) return next(err);
    if (!backlog) return next(new Error('Failed to load Backlog ' + id));
    req.backlog = backlog;
    next();
  });
};

/**
 * Backlog authorization middleware
 */
exports.hasAuthorizationBacklogRead = function(req, res, next) {
  if (req.user_team === undefined) {
    return res.status(403).send({
      message: 'Backlog: You don\'t have permission to do this action!'
    });
  } else {
    next();
  }
  // next();
};

exports.hasAuthorizationBacklogFull = function(req, res, next) {
  if (req.user_team === undefined) {
    return res.status(403).send({
      message: 'Backlog: You don\'t have permission to do this action!'
    });
  } else {
    if (req.user_team.team_type !== 'product_owner') {
      return res.status(403).send({
        message: 'Backlog: Only Product Owner do this action!'
      });
    } else {
      next();
    }
  }
  // next();
};

/**
 * Backlog prefix middleware
 */
exports.prefixBacklog = function(req, res, next) {
  var backlog = req.body;
  if (backlog.assignee !== null && backlog.assignee !== undefined && backlog.assignee !== 'deleted') {
    if (backlog.assignee._id !== undefined) {
      req.body.assignee = backlog.assignee._id;
    } else {
      var assignee = JSON.parse(backlog.assignee);
      if (assignee._id !== undefined) {
        req.body.assignee = assignee._id;
      }
    }
  }
  if (backlog.sprint !== null && backlog.sprint !== undefined) {
    if (backlog.sprint.constructor.name.toString() === 'Object') {
      if (backlog.sprint._id !== undefined) {
        req.body.sprint = backlog.sprint._id;
      }
    }
  }
  next();
};
