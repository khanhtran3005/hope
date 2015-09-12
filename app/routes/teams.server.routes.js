'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var teams = require('../../app/controllers/teams.server.controller');
  var projects = require('../../app/controllers/projects.server.controller');

  // Teams Routes
  app.route('/projects/:projectId/teams')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamRead, teams.list)
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamFull, teams.create);

  app.route('/projects/:projectId/teams/develop_teams')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamRead, teams.developTeam);

  app.route('/projects/:projectId/teams/:teamId')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamRead, teams.read)
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamFull, teams.update)
    .delete(users.requiresLogin, teams.hasAuthorizationTeamFull, teams.delete);

  app.route('/projects/:projectId/teams/:teamId/member')
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamFull, teams.addMember);

  app.route('/projects/:projectId/teams/:teamId/report')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamRead, teams.report);

  app.route('/projects/:projectId/members/remove_team')
    .post(users.requiresLogin, projects.hasAuthorizationProjectRead, teams.hasAuthorizationTeamFull, teams.removeTeamMember);

  // Finish by binding the Team middleware
  app.param('teamId', teams.teamByID);
  app.param('projectId', projects.projectByID);
};
