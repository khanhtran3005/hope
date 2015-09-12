'use strict';

var logger = require('bragi'),
  mongoose = require('mongoose'),
  Message = mongoose.model('Message'),
  User = mongoose.model('User');

var room = [];

module.exports = function(socket, io) {

  socket.on('reportChanged', function(data, callback) {
    io.sockets.in(data.meetingId).emit('reportChanged', {
      report: data.report,
      username: data.username
    });
  });

  socket.on('sendMessage', function(data, callback) {

    var _message = data.message,
      from = socket.request.user._id,
      to = data.to,
      _data = {
        message: _message,
        from: from,
        to: to
      };

    var message = new Message(_data);
    message.save(function(err) {
      if (err)
        logger.log('error', err);
    });

    User.findOne({
      _id: data.to
    }).exec(function(err, user) {
      if (err) {
        logger.log('error', err);
        return;
      }
      var socketId = user.socketId;
      logger.log('newMessage', user.socketId);
      if (socketId.trim() !== '') {
        socket.to(user.socketId).emit('newMessage', _data);
      }
    });
  });

  socket.on('joinProject', function(data, callback) {
    if (data.projectId !== null && data.projectId !== undefined) {
      socket.join(data.projectId.toString());
      io.sockets.in(data.projectId).emit('joinProject', data);
    }
  });

  socket.on('updateProject', function(data, callback) {
    io.sockets.in(data.projectId).emit('updateProject', data);
  });
  socket.on('newRecorded', function(data){
    io.sockets.in(data.meetingId).emit('newRecorded', data);
  });
  socket.on('delRecorded', function(data){
    io.sockets.in(data.meetingId).emit('delRecorded', data);
  });

};
