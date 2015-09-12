'use strict';

angular.module('chats').factory('socket', ['socketFactory',
  function(socketFactory) {

    var socket = io.connect('/');

    var Socket = socketFactory({
      ioSocket: socket
    });
    Socket.forward('error');
    Socket.forward('createdConf');
    Socket.forward('endedConf');
    Socket.forward('reportChanged');
    Socket.forward(user._id);
    Socket.forward('newMessage');
    Socket.forward('joinProject');
    Socket.forward('updateProject');
    Socket.forward('newRecorded');
    Socket.forward('delRecorded');

    return Socket;
  }
]);
