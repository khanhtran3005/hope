'use strict';

module.exports = function(app) {
  var users = require('../../app/controllers/users.server.controller');
  var projects = require('../../app/controllers/projects.server.controller');

  // Projects Routes
  app.route('/projects')
    .post(users.requiresLogin, projects.create)
    .get(users.requiresLogin, projects.projectByUserID);

  app.route('/projects/total')
    .get(users.requiresLogin, projects.countProjectOfUser);

  app.route('/projects/:projectId')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, projects.read)
    .put(users.requiresLogin, projects.hasAuthorizationFull, projects.update)
    .delete(users.requiresLogin, projects.hasAuthorizationFull, projects.delete);

  app.route('/projects/:projectId/members')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, projects.getMembers);

  app.route('/projects/:projectId/public_members')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, projects.getPublicMembers);

  app.route('/projects/:projectId/free_members')
    .get(users.requiresLogin, projects.hasAuthorizationProjectRead, projects.getFreeMembers)
    .post(users.requiresLogin, projects.hasAuthorizationFull, projects.addFreeMember);

  app.route('/projects/:projectId/free_members/:memberId')
    .delete(users.requiresLogin, projects.hasAuthorizationFull, projects.removeFreeMember);

  app.route('/projects/:projectId/members/:memberId/report')
    .get(users.requiresLogin/*, projects.hasAuthorizationFull*/, projects.report);


  app.route('/projects/:projectId/invite_members')
    .get(projects.addFreeMember)
    .post(users.requiresLogin, projects.hasAuthorizationFull, projects.inviteMember);

  app.route('/projects/:projectId/invite_members/:memberId')
    .delete(users.requiresLogin, projects.hasAuthorizationFull, projects.removeInviteMember);

  // Finish by binding the Project middleware
  app.param('projectId', projects.projectByID);

};
