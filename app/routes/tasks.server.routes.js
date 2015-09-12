'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var tasks = require('../../app/controllers/tasks.server.controller');
  var projects = require('../../app/controllers/projects.server.controller');
  var backlogs = require('../../app/controllers/backlogs.server.controller');

  // Tasks Routes
  app.route('/projects/:projectId/backlogs/:backlogId/tasks')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, tasks.hasAuthorizationTaskRead, tasks.list)
    .post(users.requiresLogin, tasks.prefixTask, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, tasks.hasAuthorizationTaskFull, tasks.create);

  app.route('/projects/:projectId/backlogs/:backlogId/tasks/:taskId')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, tasks.hasAuthorizationTaskRead, tasks.read)
    .put(users.requiresLogin, tasks.prefixTask, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, tasks.hasAuthorizationTaskFull, tasks.update)
    .delete(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, tasks.hasAuthorizationTaskFull, tasks.delete);

  // Finish by binding the Task middleware
  app.param('projectId', projects.projectByID);
  app.param('backlogId', backlogs.backlogByID);
  app.param('taskId', tasks.taskByID);
};
