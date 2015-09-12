'use strict';
var CronJob = require('cron').CronJob,
  mongoose = require('mongoose'),
  Sprint = mongoose.model('Sprint'),
  Burndown = mongoose.model('Burndown'),
  Task = mongoose.model('Task'),
  Meeting = mongoose.model('Meeting'),
  Project = mongoose.model('Project'),
  validator = require('validator'),
  logger = require('bragi'),
  _ = require('lodash'),
  async = require('async'),
  nodemailer = require('nodemailer'),
  config = require('./config'),
  path = require('path'),
  templatesDir = path.resolve(__dirname, '../app/views/mailers'),
  emailTemplates = require('email-templates'),
  moment = require('moment');

module.exports = function() {
  var cronBurndown = new CronJob('00 00 20 * * *', function() {
    var today = new Date();
    Sprint.find({
        startDate: {
          $lt: today
        },
        endDate: {
          $gt: today
        }
      })
      .populate('backlogs', 'tasks')
      .exec(function(err, sprints) {
        if (err || !sprints)
          return;

        _.forEach(sprints, function(sprint) {
          var totalEstimation = 0,
            done = 0;

          if (!sprint.backlogs)
            return;


          async.eachSeries(sprint.backlogs, function(backlog, callback) {

            Task.find({
              _id: {
                $in: backlog.tasks
              }
            }).exec(function(err, tasks) {

              _.forEach(tasks, function(task) {
                totalEstimation += task.estimate;
                done += task.remaining;
              });

              callback();

            });

          }, function(err) {

            var burndown = new Burndown({
              sprint: sprint._id,
              total: totalEstimation,
              done: done
            });

            if (totalEstimation === 0 && done === 0)
              return;

            burndown.save(function(err, burndown) {
              console.log(burndown);
            });
          });
        });
      });

  }, null, true, null);

  var email = new CronJob('0 0 8 * * *', function() {
    var today = new Date(),
      day = today.getDate(),
      month = today.getMonth(),
      year = today.getFullYear();
    var transportBatch = nodemailer.createTransport(config.mailer.options);

    Meeting.find({
      startDate: new Date(year, month, day)
    }).select('sprint type name startDate timebox').exec(function(err, meetings) {
      
      for (var i = 0; i < meetings.length; i++) {
        var meeting = meetings[i].toObject();
        var subject = 'Meeting Notification: ' + meeting.name;
        Project.findOne({
          sprints: meeting.sprint
        }).populate('people', 'email displayName').exec(function(err, project) {
          var emailList = [];

          _.forEach(project.people, function(user) {
            emailList.push(user.email);
          });
          emailTemplates(templatesDir, function(err, template) {
            if(meeting.timebox && meeting.timebox > 0)
              meeting.timebox = moment.duration(meeting.timebox, 'minutes').humanize();
            else 
              meeting.timebox = undefined;

            meeting.startDate = moment(meeting.startDate).format('MMM Do, YYYY HH:mm Z');
            meeting.type = meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1);
            var data = {
              meeting: meeting,
              project: project,
              url: config.domainNameForCron + ':' +config.port + '/#!/projects/' + project._id + '/meetings/' + meeting._id
            };
            template('meeting-notification', data, function(err, html, text) {
              transportBatch.sendMail({
                from: config.mailer.from,
                bcc: emailList,
                subject: subject,
                html: html,
                text: text
              }, function(err, responseStatus) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(responseStatus);
                }
              });
            });
          });

        });
      }
    });
  }, null, true, null);

};
