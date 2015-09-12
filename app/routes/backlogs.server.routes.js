'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var backlogs = require('../../app/controllers/backlogs.server.controller');
  var projects = require('../../app/controllers/projects.server.controller');
  var sprints = require('../../app/controllers/sprints.server.controller');

  // Backlogs Routes
  app.route('/projects/:projectId/backlogs')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, backlogs.list)
    .post(users.requiresLogin, backlogs.prefixBacklog, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogFull, backlogs.create);

  app.route('/projects/:projectId/backlogs/backlog_without_sprint')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, backlogs.backlogWithoutSprint);

  app.route('/projects/:projectId/backlogs/order_backlog')
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogFull, backlogs.orderBacklog);

  app.route('/projects/:projectId/backlogs/backlog_with_sprint/:sprintId')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.hasAuthorizationSprintRead, backlogs.hasAuthorizationBacklogRead, backlogs.backlogWithSprint);

  app.route('/projects/:projectId/backlogs/:backlogId/accept')
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogFull, backlogs.backlogAccept);

  app.route('/projects/:projectId/backlogs/:backlogId/add_to_sprint/:sprintId')
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.hasAuthorizationSprintFull, backlogs.hasAuthorizationBacklogFull, backlogs.backlogAddToSprint);

  app.route('/projects/:projectId/backlogs/:backlogId/remove_from_sprint')
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogFull, backlogs.backlogRemoveFormSprint);

  app.route('/projects/:projectId/backlogs/:backlogId')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogRead, backlogs.read)
    .put(users.requiresLogin, backlogs.prefixBacklog, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogFull, backlogs.update)
    .delete(users.requiresLogin, projects.hasAuthorizationProjectRead, backlogs.hasAuthorizationBacklogFull, backlogs.delete);

  // Finish by binding the Backlog middleware
  app.param('backlogId', backlogs.backlogByID);
  app.param('projectId', projects.projectByID);
  app.param('sprintId', sprints.sprintByID);
};
