'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var sprints = require('../../app/controllers/sprints.server.controller');
  var projects = require('../../app/controllers/projects.server.controller');

  app.route('/projects/:projectId/sprints/burndown')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.burndown);

  // Sprints Routes
  app.route('/projects/:projectId/sprints')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.hasAuthorizationSprintRead, sprints.list)
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.hasAuthorizationSprintFull, sprints.create);

  app.route('/projects/:projectId/sprints/:sprintId')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.hasAuthorizationSprintRead, sprints.read)
    .put(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.hasAuthorizationSprintFull, sprints.update)
    .delete(users.requiresLogin, projects.hasAuthorizationProjectRead, sprints.hasAuthorizationSprintFull, sprints.delete);

  // Finish by binding the Sprint middleware
  app.param('projectId', projects.projectByID);
  app.param('sprintId', sprints.sprintByID);
};
