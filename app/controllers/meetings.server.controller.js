'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  errorHandler = require('./errors.server.controller'),
  Meeting = mongoose.model('Meeting'),
  Project = mongoose.model('Project'),
  Recorded = mongoose.model('Recorded'),
  Sprint = mongoose.model('Sprint'),
  User = mongoose.model('User'),
  logger = require('bragi'),
  _ = require('lodash'),
  fs = require('fs'),
  sys = require('sys'),
  exec = require('child_process').exec,
  path = require('path');

function dateDiff(startDate, endDate) {
  var oneDay = 1000 * 60 * 60 * 24,
    first = new Date(startDate),
    last = new Date(endDate);

  return Math.ceil((first.getTime() - last.getTime()) / oneDay);
}

function calculateTimebox(type, duration) {
  var timebox;

  switch (type) {
    case 'daily':
      timebox = 15;
      break;

    case 'sprint planning':
      timebox = duration * 8 * 60 / 30;
      break;

    case 'backlog refinement':
    case 'sprint review':
    case 'sprint retrospective':
      timebox = duration * 4 * 60 / 30;
      break;
  }
  return timebox;
}

/**
 * Create a Meeting
 */
exports.create = function(req, res) {
  var meeting = new Meeting(req.body),
    sprintId = req.param('sprintId') || '';
  if (sprintId === '')
    return res.send(400, {
      message: 'sprintId is required'
    });

  meeting.user = req.user;
  meeting.sprint = sprintId;
  Sprint.findById(sprintId).exec(function(err, sprint) {
    if (err) {
      logger.logger('error', err);
    }
    if (!sprint) {
      logger.log('Sprint', 'Couldn\'t find sprint with ID ' + sprintId);
    }

    var duration = dateDiff(sprint.endDate, sprint.startDate);
    meeting.timebox = calculateTimebox(meeting.type, duration);

    meeting.save(function(err) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(meeting);
      }
    });

  });
};

/**
 * Show the current Meeting
 */
exports.read = function(req, res) {
  var meeting = req.meeting.toObject();
  var arrUser = [];
  for (var i = 0; i < meeting.confMessages.length; i++) {
    arrUser.push(meeting.confMessages[i].user);
  }
  User.find({
    _id: {
      $in: arrUser
    }
  }).select('displayName').exec(function(err, users) {
    if (err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    for (var i = 0; i < meeting.confMessages.length; i++) {
      var user = _.find(users, function(user) {
        return user._id.toString() === meeting.confMessages[i].user.toString();
      });
      delete user.profileURL;

      meeting.confMessages[i].user = user;
    }
    res.jsonp(meeting);
  });

};

/**
 * Update a Meeting
 */
exports.update = function(req, res) {
  var meeting = req.meeting;
  var duration = dateDiff(meeting.sprint.endDate, meeting.sprint.startDate);

  req.body.timebox = calculateTimebox(meeting.type, duration);
  delete req.body.confMessages;
  meeting = _.extend(meeting, req.body);

  meeting.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(meeting);
    }
  });
};

exports.updateConfMessage = function(req, res) {
  var message = req.param('message'),
    meeting = req.meeting;

  meeting.confMessages.push({
    user: req.user._id,
    message: message
  });

  meeting.save(function(err, meeting) {
    if (err)
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    return res.status(200).end();
  });
};

/**
 * Delete an Meeting
 */
exports.delete = function(req, res) {
  var meeting = req.meeting;

  meeting.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(meeting);
    }
  });
};

/**
 * List of Meetings
 */
exports.list = function(req, res) {
  Meeting.find().sort('-created').populate('user', 'displayName').exec(function(err, meetings) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.jsonp(meetings);
    }
  });
};
/**
 * List of Meetings by Sprint ID
 */
exports.listBySprintId = function(req, res) {
  var sprintId = req.param('sprintId') || '';
  if (sprintId === '')
    return res.send(400, {
      message: 'sprintId is required'
    });

  Meeting.find({
      sprint: sprintId
    }).sort('-created')
    .populate('user', 'displayName')
    // .populate('sprint')
    .exec(function(err, meetings) {
      if (err) {
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      } else {
        res.jsonp(meetings);
      }
    });
};

/**
 * List of Meetings by Sprint ID
 */
exports.listByProjectId = function(req, res) {
  var projectId = req.param('projectId') || '';

  if (projectId === '')
    return res.send(400, {
      message: 'Project is required'
    });

  Project.findById(projectId)
    .select('sprints')
    .sort({
      'startDate': 'asc'
    })
    .populate('sprints', 'meetings')
    .populate('meetings')
    .exec(function(err, project) {

      if (err) return res.send(403, {
        message: err
      });
      var arrId = [];
      for (var i in project.sprints) {
        arrId = _.union(arrId, project.sprints[i].meetings);
      }

      Meeting.find({
          '_id': {
            $in: arrId
          }
        })
        .populate('user', 'displayName')
        .exec(function(err2, meetings) {

          if (err2)
            return res.status(403).send({
              message: err2
            });
          for (var i = 0; i < meetings.length; i++) {
            meetings[i].confMessages = undefined;
          }
          return res.jsonp(meetings);
        });
    });
};

/**
 * Upload meeting records
 */
exports.uploadVideos = function(req, res) {
  var user = req.user,
    publicURL,
    files = JSON.parse(req.param('files')),
    title = files.title,
    meeting = req.meeting;
  if (files.isFirefox) {
    publicURL = storeData(files.audio, true);
    responseUploaded(req, res, meeting, publicURL, title);
  } else {
    storeData(files.audio);
    storeData(files.video);
    merge(files, function(err, publicURL) {
      if (err) {
        logger.log('error', err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }

      responseUploaded(req, res, meeting, publicURL, title);

    });
  }

};

function storeData(file) {
  var uploadDir = path.resolve(__dirname, '../../public/uploads') + '/',
    publicURL = '/uploads/',
    fileRootName = file.name.split('.').shift(),
    fileExtension = file.name.split('.').pop(),
    filePathBase = uploadDir,
    fileRootNameWithBase = filePathBase + fileRootName,
    filePath = fileRootNameWithBase + '.' + fileExtension,
    fileID = 2,
    fileBuffer;

  while (fs.existsSync(filePath)) {
    filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
    fileID += 1;
  }

  file.contents = file.contents.split(',').pop();

  fileBuffer = new Buffer(file.contents, 'base64');

  fs.writeFileSync(filePath, fileBuffer);

  return publicURL + fileRootName + '.' + fileExtension;

}

function merge(files, cb) {
  // its probably *nix, assume ffmpeg is available
  var uploadDir = path.resolve(__dirname, '../../public/uploads') + '/',
    publicURL = '/uploads/',
    audioFile = uploadDir + files.audio.name,
    videoFile = uploadDir + files.video.name,
    mergedFile = uploadDir + files.audio.name.split('.')[0] + '-merged.webm',
    exec = require('child_process').exec;
  //child_process = require('child_process');

  var command = 'ffmpeg -i ' + audioFile + ' -itsoffset -00:00:01 -i ' + videoFile + ' -map 0:0 -map 1:0 ' + mergedFile;

  exec(command, function(error, stdout, stderr) {
    if (error)
      return cb(error);

    publicURL = publicURL + files.audio.name.split('.')[0] + '-merged.webm';
    // removing audio/video files
    fs.unlink(audioFile);
    fs.unlink(videoFile);

    if (cb)
      return cb(null, publicURL);
  });
}

function responseUploaded(req, res, meeting, publicURL, title) {
  // meeting.recordedVideos.push(publicURL);
  var recorded = new Recorded({
    meeting: meeting._id,
    title: title
  });
  recorded.URL = publicURL;
  recorded.user = req.user;
  recorded.save(function(err, recorded) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    }
    User.findById(recorded.user)
      .select('displayName')
      .exec(function(err, user) {
        var object = recorded.toObject();
        object.user = user;
        return res.jsonp(object);
      });
  });
}

exports.deleteRecorded = function(req, res) {
  var recorded = req.recorded;

  recorded.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      var fileName = recorded.URL.split('/')[2],
        uploadFolder = path.resolve(__dirname, '../../public/uploads') + '/',
        fileToDelete = uploadFolder + fileName;
      fs.unlink(fileToDelete);
      res.jsonp(recorded);
    }
  });
};

/**
 * Meeting middleware
 */
exports.meetingByID = function(req, res, next, id) {
  Meeting.findById(id)
    .populate('user', 'displayName')
    .populate('sprint')
    .populate('recordedVideos')
    .exec(function(err, meeting) {
      if (err) return next(err);
      if (!meeting) return next(new Error('Failed to load Meeting ' + id));
      Recorded.find({
        _id: {
          $in: meeting.recordedVideos
        }
      }).populate('user', 'displayName').exec(function(err, records) {
        meeting.recordedVideos = records;
        req.meeting = meeting;
        next();
      });
    });
};

/**
 * Meeting authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
  if (req.meeting.user.id !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};

/**
 * Meeting middleware
 */
exports.recordedByID = function(req, res, next, id) {
  Recorded.findById(id)
    .exec(function(err, recorded) {
      if (err) return next(err);
      if (!recorded) return next(new Error('Failed to load Recorded ' + id));
      req.recorded = recorded;
      next();
    });
};

/**
 * Recorded Video owner
 */
exports.isRecordedOwner = function(req, res, next) {
  if (req.recorded.user.toString() !== req.user.id) {
    return res.status(403).send('User is not authorized');
  }
  next();
};
