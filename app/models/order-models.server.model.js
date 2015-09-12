'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  relationship = require('mongoose-relationship'),
  User = mongoose.model('User'),
  Schema = mongoose.Schema,
  Audit = mongoose.model('Audit'),
  _ = require('lodash'),
  Burndown = mongoose.model('Burndown'),
  async = require('async'),
  mongoose_delete = require('mongoose-delete'),
  logger = require('bragi');

/************************* PROJECT SCHEMA *************************/

var ProjectSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Name is required',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  equivalent: {
    type: Number,
    default: 1
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  people: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  invite_members: [{
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    key: {
      type: String,
      default: Math.random().toString(36).slice(2)
    }
  }],
  sprints: [{
    type: Schema.ObjectId,
    ref: 'Sprint'
  }],
  teams: [{
    type: Schema.ObjectId,
    ref: 'Team'
  }],
  backlogs: [{
    type: Schema.ObjectId,
    ref: 'Backlog'
  }]
});

ProjectSchema.set('toJSON', {
  virtuals: true
});

ProjectSchema.virtual('actor').get(function() {
  return this.audit_actor;
}).set(function(value) {
  if (typeof value === 'object' && value !== null) {
    this.audit_actor = value._id;
  } else {
    this.audit_actor = value;
  }
});

ProjectSchema.virtual('action_ip').get(function() {
  return this.audit_ip_at;
}).set(function(value) {
  this.audit_ip_at = value;
});

ProjectSchema.post('init', function() {
  this._original = this.toObject();
});


ProjectSchema.pre('save', function(next) {
  this.people = _.uniq(this.people);
  if (this._original !== undefined) {
    if (this.people.length === 0 && this._original.people.length === 1) {
      var err1 = new Error('Project should have more than one member!');
      return next(err1);
    }
  }
  return next();
});

ProjectSchema.pre('save', function(next) {
  var self = this;
  if (this.isNew) {
    this.people.push(this.user);
    Audit.createAudit('project', this._id, this.audit_actor, ['Created project "' + this.name + '"'], this.audit_ip_at, this.people);
  } else {
    var messages = ['Project "' + this._original.name + '" is updated'];
    var paths = this.modifiedPaths();
    var deleted = false;
    for (var j = 0; j < paths.length; j++) {
      if (paths[j] === 'deleted') {
        if (self.deleted) {
          messages = ['Delete project: ' + this.name];
        } else {
          messages = ['Restore project: ' + this.name];
        }
        deleted = true;
        break;
      }
    }
    if (deleted) {
      Audit.createAudit('project', this._id, this.audit_actor, messages, this.audit_ip_at, this.people);
    } else {
      for (var i = 0; i < paths.length; i++) {
        switch (paths[i]) {
          case 'name':
            messages.push('Change name: ' + this._original.name + ' ==> ' + this.name);
            break;
          case 'description':
            messages.push('Change description: ' + this._original.description + ' ==> ' + this.description);
            break;
        }
      }
      if (messages.length !== 1) {
        Audit.createAudit('project', this._id, this.audit_actor, messages, this.audit_ip_at, this.people);
      }
    }
  }
  next();
});

ProjectSchema.pre('remove', function(next) {
  Audit.createAudit('project', this._id, this.audit_actor, ['Removed project "' + this._original.name + '"'], this.audit_ip_at, this.people);
  next();
});

ProjectSchema.methods.getFreeMembers = function getFreeMembers(keyword, cb) {
  var self = this;
  var people = [];
  for (var i = 0; i < self.people.length; i++) {
    people.push(mongoose.Types.ObjectId(self.people[i]._id.toString()));
  }
  for (var l = 0; l < self.invite_members.length; l++) {
    people.push(mongoose.Types.ObjectId(self.invite_members[l].user.toString()));
  }
  people = _.uniq(people);
  User.find({
    $or: [{
      displayName: new RegExp(keyword, 'i')
    }, {
      email: new RegExp(keyword, 'i')
    }, {
      username: new RegExp(keyword, 'i')
    }],
    _id: {
      $not: {
        $in: people
      }
    },
    user_public: {
      $eq: true
    }
  }).select('_id email displayName').limit(10).exec(cb);
};

ProjectSchema.methods.addMemberToProject = function addMemberToProject(userId, cb, actor, ip) {
  var self = this;
  logger.log('memberId', userId);
  if (mongoose.Types.ObjectId.isValid(userId)) {
    User.findById(mongoose.Types.ObjectId(userId), function(err, user) {
      if (err)
        return cb(err);
      else {
        if (user === null) {
          var err1 = new Error('Couldn\'t find this user!');
          return cb(err1);
        } else {
          self.update({
            $addToSet: {
              'people': mongoose.Types.ObjectId(userId)
            }
          }, function(err2) {
            if (err2) {
              return cb(err2);
            } else {
              Audit.createAudit('project', self._id, actor, ['Added @' + user.displayName + ' to project "' + self.name + '"'], ip, self.people);
              return cb();
            }
          });
        }
      }
    });
  } else {
    var err3 = new Error('Member ID!!!');
    return cb(err3);
  }
};

ProjectSchema.methods.removeTeamMember = function removeTeamMember(userId, cb, actor, ip) {
  var self = this;
  Team.update({
    project: this._id
  }, {
    $pull: {
      'people': mongoose.Types.ObjectId(userId)
    }
  }, {
    multi: true
  }, function(err, teams) {
    if (!err) {
      Audit.createAudit('Team', '00000000000', actor._id, ['Removed member from Development Team'], ip, self.people);
    } else {
      Task.update({
        project: self._id,
        assignee: mongoose.Types.ObjectId(userId),
        deleted: {
          $ne: true
        }
      }, {
        $unset: {
          assignee: 1
        },
        task_status: 'To do'
      }, {
        multi: true
      }, function(err6, numberAffected) {
        if (err6) {
          logger.log('team-task-update', err6);
        }
        logger.log('team-task-update-num', numberAffected);
      });
    }
    return cb(err, teams);
  });
};

ProjectSchema.methods.removeMember = function removeMember(userId, cb, actor, ip) {
  var self = this;
  Project.findById(this._id, function(err, project) {
    for (var i = 0; i < project.invite_members.length; i++) {
      if (project.invite_members[i].user.toString() === userId.toString()) {
        project.invite_members[i].remove();
      }
    }
    for (var j = 0; j < project.people.length; j++) {
      if (project.people[j].toString() === userId.toString()) {
        project.people.splice(j, 1);
        break;
      }
    }
    project.save(function(err3) {
      if (err3) {
        return cb(err3);
      } else {
        Team.update({
          project: self._id
        }, {
          $pull: {
            'people': mongoose.Types.ObjectId(userId)
          }
        }, {
          multi: true
        }, function(err, numberAffected, rawResponse) {
          if (!err) {
            if (numberAffected !== 0)
              Audit.createAudit('Project', self._id, actor._id, ['Removed member from project'], ip, self.people);
            Task.update({
              project: self._id,
              assignee: mongoose.Types.ObjectId(userId),
              deleted: {
                $ne: true
              }
            }, {
              $unset: {
                assignee: 1
              },
              task_status: 'To do'
            }, {
              multi: true
            }, function(err6, numberAffected) {
              if (err6) {
                logger.log('team-task-update', err6);
              }
              logger.log('team-task-update-num', numberAffected);
            });
          }
          return cb(err, project);
        });
      }
    });
  });
};

ProjectSchema.methods.removeInvite = function removeInvite(userId, cb, actor, ip) {
  for (var i = 0; i < this.invite_members.length; i++) {
    if (this.invite_members[i].user.toString() === userId) {
      this.invite_members[i].remove();
    }
  }
  this.save(function(err3) {
    if (err3) {
      return cb(err3);
    } else {
      return cb(err3, this);
    }
  });
};

ProjectSchema.methods.addMember = function addMember(teamId, userId, cb, actor) {
  Team.update({
    project: mongoose.Types.ObjectId(this._id)
  }, {
    $pull: {
      'people': mongoose.Types.ObjectId(userId)
    }
  }, {
    multi: true
  }, function(err1, teams1) {
    if (err1) {
      return cb(err1, teams1);
    } else {
      Team.findById(teamId, function(err, team) {
        var people = team.people;
        people.unshift(userId);
        team.people = _.uniq(people);
        team.actor = actor;
        team.save(cb);
      });
    }
  });
};

ProjectSchema.post('save', function(project) {
  if (this.teams.length === 0) {
    var product_owner = new Team({
      name: 'Product Owner',
      desc: 'Product Owner',
      team_type: 'product_owner',
      locked: true
    });
    var stackholder = new Team({
      name: 'Stack Holder',
      desc: 'Stack Holder',
      team_type: 'stackholder',
      locked: true
    });
    var team_dev = new Team({
      name: project.name,
      desc: 'Development team',
      team_type: 'dev_team',
      locked: true
    });
    var scrum_master = new Team({
      name: 'Scrum Master',
      desc: 'Scrum Master',
      team_type: 'scrum_master',
      people: [this.user],
      locked: true
    });
    scrum_master.project = product_owner.project = stackholder.project = team_dev.project = project;
    scrum_master.user = product_owner.user = stackholder.user = team_dev.user = project.user;
    scrum_master.actor = product_owner.actor = stackholder.actor = team_dev.actor = project.user;
    product_owner.save(function(err) {
      if (err) console.log(err);
    });
    stackholder.save(function(err) {
      if (err) console.log(err);
    });
    team_dev.save(function(err) {
      if (err) console.log(err);
    });
    scrum_master.save(function(err, sm) {
      if (err) console.log(err);
      else {
        sm.people.push(project.user);
      }
    });
  }
});

ProjectSchema.plugin(mongoose_delete, {
  deletedAt: true
});
var Project = mongoose.model('Project', ProjectSchema);
module.exports = mongoose.model('Project');
/************************* TEAM Schema *************************/

/**
 * Team Schema
 */
var TeamSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: true,
    trim: true
  },
  team_type: {
    type: String,
    default: 'stackholder',
    required: true,
    trim: true,
    enum: ['product_owner', 'stackholder', 'dev_team', 'scrum_master']
  },
  desc: {
    type: String,
    default: '',
    trim: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  people: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  project: {
    type: Schema.ObjectId,
    ref: 'Project',
    childPath: 'teams'
  },
  locked: {
    type: Boolean,
    default: false
  }
});

TeamSchema.plugin(relationship, {
  relationshipPathName: 'project'
});

TeamSchema.set('toJSON', {
  virtuals: true
});

TeamSchema.virtual('actor').get(function() {
  return this.audit_actor;
}).set(function(value) {
  if (typeof value === 'object' && value !== null) {
    this.audit_actor = value._id;
  } else {
    this.audit_actor = value;
  }
});

TeamSchema.virtual('action_ip').get(function() {
  return this.audit_ip_at;
}).set(function(value) {
  this.audit_ip_at = value;
});

TeamSchema.post('init', function() {
  this._original = this.toObject();
});

TeamSchema.pre('save', function(next) {
  this.people = _.uniq(this.people);
  next();
});

TeamSchema.pre('save', function(next) {
  var p = _.clone(this.people);
  var self = this;
  var paths = self.modifiedPaths();
  p.push(this.audit_actor);
  p = _.uniq(p);
  if (this.isNew) {
    Audit.createAudit('team', self._id, self.audit_actor, ['Development Team was created with name "' + self.name + '"'], self.audit_ip_at, p);
  } else {
    var messages = ['Team "' + self._original.name + '" is updated'];
    for (var i = 0; i < paths.length; i++) {
      switch (paths[i]) {
        case 'name':
          messages.push('Changed name: ' + self._original.name + ' ==> ' + self.name);
          break;
        case 'desc':
          messages.push('Changed description: ' + self._original.desc + ' ==> ' + self.desc);
          break;
        case 'team_type':
          messages.push('Changed team\'s type: ' + self._original.team_type + ' ==> ' + self.team_type);
          break;
        case 'people':
          var members = [];
          for (var k = 0; k < self.people.length; k++) {
            members.push(self.people[k]);
          }
          messages.push(members);
          break;
      }
    }
    if (messages.length !== 1) {
      async.forEach(messages, function(message, callback) {
        var index = _.findIndex(messages, message);
        if (Array.isArray(message)) {
          User.find({
            _id: {
              $in: message
            }
          }).select('displayName email').exec(function(err, users) {
            var str = '';
            _.forEach(users, function(user) {
              str += ' @' + user.displayName + ' (' + user.email + ')';
            });
            str += '.';
            messages.splice(index, 1, 'Updated team\'s members:' + str);

            callback();
          });
        } else {
          callback();
        }
      }, function(err) {
        // if any of the saves produced an error, err would equal that error
        if (err) {
          console.log(err);
        } else {
          Audit.createAudit('team', self._id, self.audit_actor, messages, self.audit_ip_at, p);
        }
      });
    }
  }
  next();
});

TeamSchema.pre('remove', function(next) {
  var p = _.clone(this.people);
  p.push(this.user);
  p = _.uniq(p);
  Audit.createAudit('team', this._id, this.audit_actor, ['Removed team "' + this._original.name + '"'], this.audit_ip_at, p);
  next();
});

TeamSchema.pre('save', function(next) {
  var count_people = this.people.length;
  switch (this.team_type) {
    case 'product_owner':
      if (count_people > 1) {
        var err1 = new Error('One project can have only one Product Owner.');
        next(err1);
      }
      break;
    case 'stackholder':
      if (count_people > 3) {
        var err2 = new Error('The maximum of stake holder is 3');
        next(err2);
      }
      break;
    case 'dev_team':
      if (count_people > 10) {
        var err3 = new Error('The maximum of members in a Development Team is 10');
        next(err3);
      }
      break;
    case 'scrum_master':
      if (count_people > 1) {
        var err4 = new Error('One project can have only one Scrum master');
        next(err4);
      }
      break;
  }
  next();
});

TeamSchema.pre('remove', function(next) {
  if (this.locked) {
    var err = new Error('Couldn\'t delete this team!');
    next(err);
  } else {
    next();
  }
});

TeamSchema.post('remove', function() {
  var self = this;
  if (!this.locked) {
    Backlog.update({
      assignee: self._id
    }, {
      $unset: {
        assignee: 1,
        sprint: 1
      },
      backlog_status: 'Estimation'
    }, {
      multi: true
    }, function(err6, numberAffected) {
      if (err6) {
        logger.log('team-backlog-update', err6);
      }
      logger.log('team-backlog-update-num', numberAffected);
    });
  }
});

TeamSchema.statics.findByProjectAndMember = function(query, callback) {
  return this.find(query).sort('-created').populate('people', 'displayName attachment').exec(function(err, teams) {
    if (err) {
      callback(err);
    } else {
      var people = [];
      for (var i = 0; i < teams.length; i++) {
        for (var j = 0; j < teams[i].people.length; j++) {
          people.unshift(teams[i].people[j]._id.toString());
        }
      }
      Project.findById(query.project).populate('people', 'displayName attachment').exec(function(err1, project) {
        var p = {
          _id: 'project_member',
          project: query.project,
          user: project.user,
          people: [],
          locked: false,
          desc: 'Project Member',
          team_type: 'project_member',
          name: 'Project Member'
        };
        for (var n = 0; n < project.people.length; n++) {
          var exist = false;
          for (var m = 0; m < people.length; m++) {
            if (people[m].toString() === project.people[n]._id.toString()) {
              exist = true;
              break;
            }
          }
          if (!exist) {
            p.people.unshift(project.people[n]);
          }
        }
        teams.unshift(p);
        callback(null, teams);
      });
    }
  });
};

var Team = mongoose.model('Team', TeamSchema);
module.exports = mongoose.model('Team');
/************************* BACKLOG SCHEMA *************************/

/**
 * Backlog Schema
 */
var BacklogSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Name is required',
    trim: true
  },
  desc: {
    type: String,
    default: '',
    trim: true
  },
  point: {
    type: Number,
    default: 1,
    required: true,
    min: 0,
    max: 100
  },
  estimate: {
    type: Number,
    default: 0,
    required: true
  },
  backlog_status: {
    type: String,
    default: 'New',
    required: true,
    trim: true,
    enum: ['New', 'Estimation', 'Sprint', 'Assigned']
  },
  backlog_type: {
    type: String,
    default: 'Feature',
    required: true,
    trim: true,
    enum: ['Feature', 'Bug', 'Spike', 'Other']
  },
  accept: {
    type: Boolean,
    default: false
  },
  assignee: {
    type: Schema.ObjectId,
    ref: 'Team'
  },
  created: {
    type: Date,
    default: Date.now
  },
  project: {
    type: Schema.ObjectId,
    ref: 'Project',
    childPath: 'backlogs'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  tasks: [{
    type: Schema.ObjectId,
    ref: 'Task'
  }],
  sprint: {
    type: Schema.ObjectId,
    ref: 'Sprint',
    childPath: 'backlogs'
  },
});

BacklogSchema.plugin(relationship, {
  relationshipPathName: 'project'
});

BacklogSchema.plugin(relationship, {
  relationshipPathName: 'sprint'
});

BacklogSchema.set('toObject', {
  virtuals: true
});

BacklogSchema.set('toJSON', {
  virtuals: true
});

BacklogSchema.virtual('actor').get(function() {
  return this.audit_actor;
}).set(function(value) {
  if (typeof value === 'object' && value !== null) {
    this.audit_actor = value._id;
  } else {
    this.audit_actor = value;
  }
});

BacklogSchema.virtual('action_ip').get(function() {
  return this.audit_ip_at;
}).set(function(value) {
  this.audit_ip_at = value;
});

BacklogSchema.post('init', function() {
  this._original = this.toObject();
});

BacklogSchema.pre('save', function(next) {
  this.people = _.uniq(this.people);
  if (this.sprint !== undefined) {
    this.backlog_status = 'Assigned';
  }
  if (this.sprint === undefined && this.backlog_status === 'Assigned') {
    this.backlog_status = 'Sprint';
  }
  next();
});

BacklogSchema.pre('save', function(next) {
  var self = this;
  var paths = self.modifiedPaths();
  Team.findById(this.assignee, function(err, team) {
    if (err) {
      console.log(err);
    } else {
      var people = [];
      if (team !== null) people = self.people;
      var p = _.clone(people);
      p.push(self.audit_actor);
      p = _.uniq(p);
      if (self.isNew) {
        Audit.createAudit('backlog', self._id, self.audit_actor, ['Backlog "' + self.name + '" is created'], self.audit_ip_at, p);
      } else {
        logger.log('audit', paths);
        var messages = ['Updated backlog ' + self._original.name];
        var deleted = false;
        for (var j = 0; j < paths.length; j++) {
          if (paths[j] === 'deleted') {
            if (self.deleted) {
              messages = ['Delete backlog: ' + this.name];
            } else {
              messages = ['Restore backlog: ' + this.name];
            }
            deleted = true;
            break;
          }
        }
        if (deleted) {
          Audit.createAudit('backlog', self._id, self.audit_actor, messages, self.audit_ip_at, p);
        } else {
          messages = ['Backlog "' + self._original.name + '" is updated'];
          for (var i = 0; i < paths.length; i++) {
            switch (paths[i]) {
              case 'name':
                messages.push('Changed backlog\'s name: ' + self._original.name + ' ==> ' + self.name);
                break;
              case 'desc':
                messages.push('Changed description: ' + self._original.desc + ' ==> ' + self.desc);
                break;
              case 'team_type':
                messages.push('Changed team\'s type: ' + self._original.team_type + ' ==> ' + self.team_type);
                break;
              case 'point':
                messages.push('Changed point: ' + self._original.point + ' ==> ' + self.point);
                break;
              case 'estimate':
                messages.push('Changed estimate: ' + self._original.estimate + ' ==> ' + self.estimate);
                break;
              case 'backlog_status':
                messages.push('Changed backlog status: ' + self._original.backlog_status + ' ==> ' + self.backlog_status);
                break;
              case 'assignee':
                if (self._original.assignee || self.assignee)
                  messages.push({
                    assignee: [self._original.assignee, self.assignee]
                  });
                break;
              case 'sprint':
                messages.push({
                  sprint: [self._original.sprint, self.sprint]
                });
                break;
            }
          }
          if (messages.length !== 1) {
            async.forEach(messages, function(message, callback) {
              if (typeof message === 'object') {
                var index = _.findIndex(messages, message);
                if (message.sprint) {
                  var Sprint = mongoose.model('Sprint', SprintSchema);
                  Sprint.find({
                    $or: [{
                      _id: message.sprint[0]
                    }, {
                      _id: message.sprint[1]
                    }]
                  }).select('name').exec(function(err, sprints) {
                    if (message.sprint[0])
                      messages.splice(index, 1, 'Moved backlog out of sprint "' + sprints[0].name + '"');
                    else
                      messages.splice(index, 1, 'Moved backlog to Sprint "' + sprints[0].name + '"');
                    callback();
                  });
                }
                if (message.assignee) {
                  Team.find({
                    $or: [{
                      _id: message.assignee[0]
                    }, {
                      _id: message.assignee[1]
                    }]
                  }).select('name').exec(function(err, teams) {
                    if (err)
                      return logger.log('error', err);
                    logger.log('message.assignee', message.assignee);
                    logger.log('teams', teams);
                    if (!teams[0])
                      messages.splice(index, 1, 'This Backlog is assigned to team "' + teams[0].name + '"');
                    else if (!teams[1])
                      messages.splice(index, 1, 'This Backlog is unassigned to team "' + teams[0].name + '"');
                    else
                      messages.splice(index, 1, 'Changed the team responsible for this Backlog: ' + teams[0].name + ' ==> ' + teams[1].name);

                    callback();
                  });
                }

              } else {
                callback();
              }
            }, function(err) {
              // if any of the saves produced an error, err would equal that error
              if (err) {
                console.log(err);
              } else {
                Audit.createAudit('backlog', self._id, self.audit_actor, messages, self.audit_ip_at, p);
              }
            });
          }
        }
      }
    }
  });
  next();
});

BacklogSchema.post('save', function() {
  var self = this;
  if (self.sprint !== undefined && self.sprint !== null && self.assignee !== undefined && self.assignee !== null) {
    var Sprint = mongoose.model('Sprint', SprintSchema);
    Sprint.findById(self.sprint, function(err, sprint) {
      if (!err) {
        Backlog.findByProjectAndEstimate({
          sprint: self.sprint,
          assignee: self.assignee,
          deleted: {
            $ne: true
          }
        }, function(err, backlogs) {
          if (!err) {
            var time_sprint = sprint.time_hour;
            var time_backlogs = 0;
            var people = [];
            for (var i = 0; i < backlogs.length; i++) {
              var backlog = backlogs[i].toJSON();
              if (backlogs[i].assignee !== undefined && backlogs[i].assignee !== null && backlogs[i].assignee.people !== undefined)
                people = _.union(people, backlogs[i].assignee.people);
              if (backlog !== null && backlog !== undefined && backlog.hours !== null && backlog.hours !== undefined)
                time_backlogs += backlog.hours;
            }
            if (time_backlogs > time_sprint) {
              Audit.createAudit('sprint', sprint._id, null, ['Backlog "' + self.name + '" has just been added made your team\'s work hours over the limit.' ], '', people);
            }
          }
        });
      }
    });
  }
});

BacklogSchema.pre('remove', function(next) {
  if (this.locked) {
    var err = new Error('Can\'t delete this team!');
    next(err);
  } else {
    next();
  }
});

BacklogSchema.pre('remove', function(next) {
  var self = this;
  Team.findById(this.assignee, function(err, team) {
    if (err) {
      console.log(err);
    } else {
      var people = [];
      if (team !== null) people = self.people;
      var p = _.clone(people);
      p.push(self.audit_actor);
      p = _.uniq(p);
      Audit.createAudit('backlog', this._id, this.audit_actor, ['Removed backlog "' + this._original.name + '"'], this.audit_ip_at, p);
    }
  });
  next();
});

BacklogSchema.statics.findByIdAndEstimate = function(query, callback) {
  return this.findOne(query).populate('user', 'displayName').populate('tasks', null, {
    deleted: {
      $ne: true
    }
  }).populate('assignee').exec(function(err, doc) {
    if (err) {
      return callback(err, null);
    } else {
      var estimate = 0;
      var remaining = 0;
      var process_percent = 0;
      var p = {
        pestimate: estimate,
        premaining: remaining,
        process_percent: process_percent
      };
      if (doc !== null && doc !== undefined && doc.tasks !== undefined) {
        var tasks = doc.tasks;
        for (var i = 0; i < tasks.length; i++) {
          estimate += tasks[i].compute_estimate;
          remaining += tasks[i].compute_remaining;
        }
        if (estimate !== 0)
          process_percent = Math.round((remaining / estimate) * 10000) / 100;
        else
          process_percent = 0;
        p = {
          pestimate: estimate,
          premaining: remaining,
          process_percent: process_percent
        };
      }
      _.extend(doc._doc, p);
      return callback(null, doc);
    }
  });
};

BacklogSchema.statics.findByProjectAndEstimate = function(query, callback) {
  return this.find(query).sort('-created').populate('project', '_id name equivalent').populate('user', 'displayName').populate('assignee', '_id name people').populate('tasks', null, {
    deleted: {
      $ne: true
    }
  }).populate('sprint', 'name').exec(function(err, docs) {
    if (err) {
      return callback(err, null);
    } else {
      for (var j = 0; j < docs.length; j++) {
        var doc = docs[j];
        var tasks = docs[j].tasks;
        var estimate = 0;
        var remaining = 0;
        var process_percent = 0;
        var hour_team = 0;
        var mesg;
        var hours = doc.project.equivalent * doc.point;
        if (doc.assignee !== undefined && doc.assignee !== null && doc.assignee.people !== undefined)
          hour_team = hours * doc.assignee.people.length;
        var p = {
          pestimate: 0,
          premaining: 0,
          process_percent: 0,
          hours: hours,
          hour_team: hour_team,
          mes: undefined,
          count_task: 0
        };
        if (tasks !== null && tasks !== undefined) {
          for (var i = 0; i < tasks.length; i++) {
            estimate += tasks[i].compute_estimate;
            remaining += tasks[i].compute_remaining;
          }
          process_percent = Math.round((remaining / estimate) * 10000) / 100;
          p = {
            pestimate: estimate,
            premaining: remaining,
            process_percent: process_percent,
            hours: hours,
            hour_team: hour_team,
            mesg: undefined,
            count_task: tasks.length
          };
        } else {
          p.mesg = 'Not have tasks';
        }
        _.extend(docs[j]._doc, p);
      }
      return callback(null, docs);
    }
  });
};

BacklogSchema.plugin(mongoose_delete, {
  deletedAt: true
});
var Backlog = mongoose.model('Backlog', BacklogSchema);
module.exports = mongoose.model('Backlog');
/************************* BACKLOG SCHEMA *************************/

/**
 * Task Schema
 */
var TaskSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Name is required',
    trim: true
  },
  desc: {
    type: String,
    default: '',
    trim: true
  },
  estimate: {
    type: Number,
    default: 0,
    min: 0,
    // required: true
  },
  remaining: { //this done not remaining
    type: Number,
    default: 0
  },
  task_status: {
    type: String,
    default: 'To do',
    required: true,
    trim: true,
    enum: ['To do', 'Done', 'Processing']
  },
  assignee: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  backlog: {
    type: Schema.ObjectId,
    ref: 'Backlog',
    childPath: 'tasks',
    required: true
  },
  project: {
    type: Schema.ObjectId,
    ref: 'Project'
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

TaskSchema.path('backlog', {
  set: function(backlog) {
    return backlog;
  }
});

TaskSchema.set('toObject', {
  virtuals: true
});

TaskSchema.set('toJSON', {
  virtuals: true
});

TaskSchema.virtual('task_percent').get(function() {
  var estimate = this.estimate;
  var remaining = this.remaining;
  if (estimate <= remaining) {
    return 100;
  }
  var percent = Math.round(remaining / estimate * 100);
  return percent;
});

TaskSchema.virtual('compute_estimate').get(function() {
  var estimate = this.estimate;
  return estimate;
});

TaskSchema.virtual('compute_remaining').get(function() {
  var remaining = this.remaining;
  return remaining;
});

TaskSchema.virtual('actor').get(function() {
  return this.audit_actor;
}).set(function(value) {
  if (typeof value === 'object' && value !== null) {
    this.audit_actor = value._id;
  } else {
    this.audit_actor = value;
  }
});

TaskSchema.virtual('action_ip').get(function() {
  return this.audit_ip_at;
}).set(function(value) {
  this.audit_ip_at = value;
});

TaskSchema.post('init', function() {
  this._original = this.toObject();
});

TaskSchema.pre('save', function(next) {
  this.backlog = this.backlog.toJSON();
  next();
});

TaskSchema.pre('save', function(next) {
  var assignee = this.assignee;
  var backlog = this.backlog.toJSON();
  if (assignee !== null && assignee !== undefined && assignee._id !== undefined) assignee = assignee._id;
  if (assignee !== undefined && assignee !== null) {
    if (backlog !== undefined && backlog !== null) {
      var exist = false;
      if (backlog.assignee !== null && backlog.assignee !== undefined && backlog.assignee.people !== undefined) {
        for (var i = 0; i < backlog.assignee.people.length; i++) {
          if (backlog.assignee.people[i].toString() === assignee.toString()) {
            exist = true;
            break;
          }
        }
      }
      if (!exist) {
        var err1 = new Error('Assigner isn\'t in this team.');
        return next(err1);
      }
    }
    if (this.task_status === 'Done') {
      this.remaining = this.estimate;
    }
    if (this.remaining == this.estimate) {
      this.task_status = 'Done';
    }
    next();
  } else {
    // if (this.task_status === 'Processing' || this.task_status === 'Done') {
    //   var err2 = new Error('You should assign this task to someone before save.');
    //   return next(err2);
    // }
    next();
  }
});

TaskSchema.pre('save', function(next) {
  var self = this;
  var paths = self.modifiedPaths();
  var isNew = this.isNew;
  var backlog = this.backlog.toJSON();
  if (backlog !== undefined && backlog !== null) {
    var people = [];
    if (backlog.assignee !== undefined && backlog.assignee !== null && backlog.assignee.people !== undefined) people = backlog.assignee.people;
    var p = _.clone(people);
    p.push(self.audit_actor);
    p = _.uniq(p);
    if (isNew) {
      Audit.createAudit('task', self._id, self.audit_actor, ['Create task - ' + self.name], self.audit_ip_at, p);
    } else {
      var deleted = false;
      var messages = ['Updated task - ' + self._original.name];
      for (var j = 0; j < paths.length; j++) {
        if (paths[j] === 'deleted') {
          if (self.deleted) {
            messages = ['Delete task: ' + this.name];
          } else {
            messages = ['Restore task: ' + this.name];
          }
          deleted = true;
          break;
        }
      }
      if (deleted) {
        Audit.createAudit('task', self._id, self.audit_actor, messages, self.audit_ip_at, p);
      } else {
        for (var i = 0; i < paths.length; i++) {
          switch (paths[i]) {
            case 'name':
              messages.push('Changed Task\'s name: ' + self._original.name + ' ==> ' + self.name);
              break;
            case 'desc':
              messages.push('Changed Task\'s description: ' + self._original.desc + ' ==> ' + self.desc);
              break;
            case 'team_type':
              messages.push('Changed Task\'s type: ' + self._original.remaining + ' ==> ' + self.remaining);
              break;
            case 'task_status':
              messages.push('Changed Task\'s status: ' + self._original.task_status + ' ==> ' + self.task_status);
              break;
            case 'estimate':
              messages.push('Changed estimate: ' + self._original.estimate + ' ==> ' + self.estimate);
              break;
          }
        }
        if (messages.length !== 1) {
          Audit.createAudit('task', self._id, self.audit_actor, messages, self.audit_ip_at, p);
        }
      }
    }
  } else {
    Audit.createAudit('task', self._id, self.audit_actor, ['Updated task'], self.audit_ip_at, []);
  }
  // if (this.backlog.toString() === 'null') {
  //   var deleted1 = false;
  //   var messages1 = ['Update task - ' + self.name];
  //   for (var h = 0; h < paths.length; h++) {
  //     if (paths[h] === 'deleted') {
  //       if (self.deleted) {
  //         messages1 = ['Delete task: ' + this.name];
  //       } else {
  //         messages1 = ['Restore task: ' + this.name];
  //       }
  //       deleted1 = true;
  //       break;
  //     }
  //   }
  //   if (deleted1) {
  //     Audit.createAudit('task', self._id, self.audit_actor, messages1, self.audit_ip_at, []);
  //   }
  // }
  next();
});

TaskSchema.pre('save', function(next) {
  var backlog = this.backlog.toJSON();
  if (backlog !== null && backlog._id !== undefined) this.backlog = backlog._id;
  next();
});

TaskSchema.post('save', function(task) {
  var self = this;
  if (this.backlog.toString() !== 'null') {
    Backlog.findByIdAndUpdate(this.backlog, {
      $addToSet: {
        'tasks': self._id
      }
    }, function(err, doc) {
      if (err) {
        logger.log('After task saved, backlog', err);
      }
    });
  }
});

TaskSchema.pre('remove', function(next) {
  var self = this;
  var backlog = this.backlog.toJSON();
  if (backlog !== undefined && backlog !== null) {
    var people = [];
    if (backlog.assignee !== undefined && backlog.assignee !== null && backlog.assignee.people !== undefined) people = backlog.assignee.people;
    var p = _.clone(people);
    p.push(self.audit_actor);
    p = _.uniq(p);
    Audit.createAudit('task', this._id, this.audit_actor, ['Removed task "' + this._original.name + '"'], this.audit_ip_at, p);
  }
  next();
});

TaskSchema.plugin(mongoose_delete, {
  deletedAt: true
});
var Task = mongoose.model('Task', TaskSchema);
module.exports = mongoose.model('Task');

/************************* TEAM CALLBACKS *************************/

/**
 * Sprint Schema
 */
var SprintSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Sprint name',
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  wtime: {
    type: Number,
    default: 8,
    required: true,
    min: 1,
    max: 8
  },
  startDate: {
    type: Date,
    default: Date.now,
    required: 'Please enter Sprint\'s start date.'
  },
  endDate: {
    type: Date,
    required: 'Please enter Sprint\'s end date.'
  },
  created: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  projectId: {
    type: Schema.ObjectId,
    ref: 'Project',
    childPath: 'sprints'
  },
  icon: {
    type: String,
    default: 'fa fa-star'
  },
  color: {
    type: String,
    default: '#0aa699',
    lowercase: true
  },
  meetings: [{
    type: Schema.ObjectId,
    ref: 'Meeting'
  }],
  backlogs: [{
    type: Schema.ObjectId,
    ref: 'Backlog'
  }]
});

SprintSchema.statics.burndown = function(sprintId, cb) {
  this.findById(sprintId).exec(function(err, sprint) {
    if(err)
      return cb(err);
    if(!sprint)
      return cb('Couldn\'t find this sprint.');
    Burndown.find({
        sprint: sprintId
      })
      .sort({
        date: 'asc'
      })
      .exec(function(err, burndowns) {
        if (err || !burndowns || burndowns.length <= 0)
          return cb(err);
        if (!burndowns || burndowns.length <= 0)
          return cb('Couldn\'t find any data for this sprint.');

        var burndownData = [];
        burndowns = _.uniq(burndowns, function(burndown) {
          return burndown.date;
        });
        var arrBurndown = [];
        _.forEach(burndowns, function(burndown) {
          arrBurndown.push({
            date: burndown.date,
            done: burndown.done
          });
        });
        var lastBurndown = _.last(burndowns);
        // console.log(lastBurndown);
        var data = {
          sprintId: sprint._id,
          name: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          burndown: arrBurndown,
          total: lastBurndown.total
        };
        burndownData.push(data);
        cb(err, burndownData);
      });
  });

};
SprintSchema.plugin(relationship, {
  relationshipPathName: 'projectId'
});

SprintSchema.set('toObject', {
  virtuals: true
});

SprintSchema.set('toJSON', {
  virtuals: true
});

SprintSchema.virtual('actor').get(function() {
  return this.audit_actor;
}).set(function(value) {
  if (typeof value === 'object' && value !== null) {
    this.audit_actor = value._id;
  } else {
    this.audit_actor = value;
  }
});

SprintSchema.virtual('action_ip').get(function() {
  return this.audit_ip_at;
}).set(function(value) {
  this.audit_ip_at = value;
});

SprintSchema.post('init', function() {
  this._original = this.toObject();
});

SprintSchema.virtual('time').get(function() {
  if (this.startDate === undefined || this.endDate === undefined)
    return 0;
  var ONE_DAY = 1000 * 60 * 60 * 24;
  var date1_ms = this.startDate.getTime();
  var date2_ms = this.endDate.getTime();
  var diff = Math.abs(date1_ms - date2_ms);
  return Math.round(diff / ONE_DAY);
});

SprintSchema.virtual('time_hour').get(function() {
  if (this.startDate === undefined || this.endDate === undefined)
    return 0;
  var ONE_DAY = 1000 * 60 * 60 * 24;
  var date1_ms = this.startDate.getTime();
  var date2_ms = this.endDate.getTime();
  var diff = Math.abs(date1_ms - date2_ms);
  return Math.round(diff / ONE_DAY) * this.wtime;
});

SprintSchema.pre('save', function(next) {
  this.people = _.uniq(this.people);
  next();
});

SprintSchema.pre('save', function(next) {
  var self = this;
  var paths = self.modifiedPaths();
  Project.findById(this.projectId, function(err, project) {
    if (err) {
      console.log(err);
    } else {
      var people = [];
      if (project !== null) people = project.people;
      var p = _.clone(people);
      p.push(self.audit_actor);
      p = _.uniq(p);
      if (self.isNew) {
        Audit.createAudit('sprint', self._id, self.audit_actor, ['Created sprint "' + self.name + '"'], self.audit_ip_at, p);
      } else {
        var messages = ['Updated Sprint "' + self._original.name + '"'];
        var deleted = false;
        for (var j = 0; j < paths.length; j++) {
          if (paths[j] === 'deleted') {
            if (self.deleted) {
              messages = ['Deleted sprint: ' + self._original.name];
            } else {
              messages = ['Restored sprint: ' + this.name];
            }
            deleted = true;
            break;
          }
        }
        if (deleted) {
          Backlog.update({
            sprint: self._id,
            deleted: {
              $ne: true
            }
          }, {
            $unset: {
              sprint: 1
            },
            backlog_status: 'Sprint'
          }, {
            multi: true
          }, function(err6, numberAffected) {
            if (err6) {
              logger.log('sprint-backlog-update', err6);
            }
            logger.log('sprint-backlog-update-num', numberAffected);
          });
          Audit.createAudit('sprint', self._id, self.audit_actor, messages, self.audit_ip_at, p);
        } else {
          for (var i = 0; i < paths.length; i++) {
            switch (paths[i]) {
              case 'name':
                messages.push('Changed Sprint\'s name: ' + self._original.name + ' ==> ' + self.name);
                break;
              case 'description':
                messages.push('Changed Sprint\'s description: ' + self._original.description + ' ==> ' + self.description);
                break;
              case 'startDate':
                messages.push('Changed Sprint\'s start date: ' + self._original.startDate + ' ==> ' + self.startDate);
                break;
              case 'endDate':
                messages.push('Changed Sprint\'s end date: ' + self._original.endDate + ' ==> ' + self.endDate);
                break;
            }
          }
          if (messages.length !== 1) {
            Audit.createAudit('sprint', self._id, self.audit_actor, messages, self.audit_ip_at, p);
          }
        }
      }
    }
  });
  next();
});

SprintSchema.pre('remove', function(next) {
  var self = this;
  Project.findById(this.assignee, function(err, project) {
    if (err) {
      console.log(err);
    } else {
      var people = [];
      if (project !== null) people = project.people;
      var p = _.clone(people);
      p.push(self.audit_actor);
      p = _.uniq(p);
      Audit.createAudit('sprint', this._id, this.audit_actor, ['Removed Sprint "' + this._original.name + '"'], this.audit_ip_at, p);
    }
  });
  next();
});

SprintSchema.plugin(mongoose_delete, {
  deletedAt: true
});
mongoose.model('Sprint', SprintSchema);

/*--------------------------------------------------*/
/**
 * Meeting Schema
 */
var MeetingSchema = new Schema({
  name: {
    type: String,
    default: '',
    required: 'Please fill Meeting name',
    trim: true
  },
  type: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    enum: [
      'normal',
      'daily',
      'sprint planning',
      'backlog refinement',
      'sprint review',
      'sprint retrospective'
    ]
  },
  timebox: {
    type: Number,
    default: 15 //minute
  },
  report: {
    type: String
  },
  sprint: {
    type: Schema.ObjectId,
    ref: 'Sprint',
    // required: 'sprint id is required.',
    childPath: 'meetings'
  },
  startDate: {
    type: Date,
    required: 'Please enter meeting start date.'
  },
  endDate: {
    type: Date
  },
  isAllDay: {
    type: Boolean,
    default: false
  },
  created: {
    type: Date,
    default: Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  conferences: [{
    type: Schema.ObjectId,
    ref: 'Chat'
  }],
  recordedVideos: [{
    type: Schema.ObjectId,
    ref: 'Recorded'
  }],
  confMessages: [{
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    message: {
      type: String,
      required: 'Please enter your message!'
    }
  }]
});

MeetingSchema.plugin(relationship, {
  relationshipPathName: 'sprint'
});

mongoose.model('Meeting', MeetingSchema);
