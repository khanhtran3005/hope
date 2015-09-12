'use strict';
// This file handles socket.io based reliable signaling

// require('reliable-signaler')(httpServer || expressServer || portNumber);
var logger = require('bragi'),
    mongoose = require('mongoose'),
    Chat = mongoose.model('Chat'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    config = require('./config'),
    passportSocketIo = require('passport.socketio');

module.exports = ReliableSignaler;

function ReliableSignaler(app, sessionStore, cookieParser, socketCallback) {
    var io = require('socket.io')(app);
    /**
     * Config socket.io
     * @ref https://github.com/Automattic/socket.io/wiki/Configuring-Socket.IO
     */
    io.use(passportSocketIo.authorize({
        cookieParser: cookieParser,
        secret: config.sessionSecret, // the session_secret to parse the cookie
        store: sessionStore, // we NEED to use a sessionstore. no memorystore please
        success: onAuthorizeSuccess, // *optional* callback on success - read more below
        fail: onAuthorizeFail, // *optional* callback on fail/error - read more below
    }));

    function onAuthorizeSuccess(data, accept) {
        /// accept connection
        console.log('Connected with passport');
        accept();
    }

    function onAuthorizeFail(data, message, error, accept) {
        // error indicates whether the fail is due to an error or just a unauthorized client
        if (error) throw new Error(message);
        
        // logger.log('failed connection to socket.io:', data, message, error);
        
        // send the (not-fatal) error-message to the client and deny the connection
        return accept(new Error(message));
    }

    var listOfRooms = {};
    io.on('connection', function(socket) {
        var currentUser = socket;
        if(socket.request.user){
            var user = socket.request.user;
            User.findOne({_id: user._id}, function(err, user){
                user.socketId = socket.id;
                user.save();
            });
        }
        socket.on('keep-in-server', function(roomid, callback) {
            listOfRooms[roomid] = roomid;
            currentUser.roomid = roomid;
            logger.log('keep-in-server', currentUser.roomid);
            if (callback) callback();
        });

        socket.on('get-session-info', function(data, callback) {
            var roomid = data.roomid,
                userId = data.userId;
            if (roomid && userId) {
                Chat.findById(roomid).exec(function(err, chat) {
                    if (err) {
                        callback({
                            error: err
                        });
                        return;
                    }
                    if (!chat) {
                        callback({
                            error: 'Can not find this room'
                        });
                        return;
                    }
                    socket.join(roomid);
                    //update joined members
                    chat.members = _.union(chat.members, [userId]);
                    chat.save();

                    callback({
                        sessionid: chat._id,
                        moderatorid: chat.user
                    }); //send chatId and created userId
                    return;
                });
            }
        });

        //subscribe to a meeting.
        socket.on('subscribe', function(data) {
            socket.join(data.meetingId);
        });
        socket.on('connect', function() {
            console.log('connect event');
        });
        socket.on('event', function(data) {
            console.log('"event" event');
        });
        socket.on('subscribeToRoom', function(data) {
            socket.join(data.roomid);
        });
        socket.on('new-room', function(data) {
            socket.join(data.roomid);

            Chat.findById(data.roomid).exec(function(err, chat) {
                if (err) {
                    return;
                }
                if (!chat) {
                    return;
                }

                io.sockets.in(data.meetingId).emit('createdConf', {
                    sessionid: chat._id
                });
                return;
            });

        });
        socket.on('endedConf', function(data){
            io.sockets.in(data.meetingId).emit('endedConf');
        });
        socket.on('message', function(message) {
            socket.broadcast.emit('message', message);
        });

        socket.on('disconnect', function() {
            if(socket.request.user){
                var user = socket.request.user;
                User.findOne({_id: user._id}, function(err, user){
                    if(err){
                        logger.log('err', err);
                        return;
                    }
                    user.socketId = '';
                    user.save();
                });
            }
            if (currentUser && currentUser.roomid && listOfRooms[currentUser.roomid]) {
                Chat.findOne({
                    _id: currentUser.roomid
                }, function(err, chat) {
                    if (err) {
                        return;
                    }

                    if (!chat)
                        return;
                    else {
                        chat.status = 2;
                        chat.save(function(err, saved) {
                            logger.log('saved', err, saved);
                        });
                        delete listOfRooms[currentUser.roomid];
                        currentUser = null;
                    }
                });

            }
        });

        if (socketCallback) {
            socketCallback(socket, io);
        }
    });

    function findClientsSocketByRoomId(roomId) {
        var res = [],
            room = io.sockets.adapter.rooms[roomId];
        if (room) {
            for (var id in room) {
                res.push(io.sockets.adapter.nsp.connected[id]);
            }
        }
        return res;
    }
}
