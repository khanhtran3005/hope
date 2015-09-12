'use strict';

angular.module('chats').factory('ChatHelper', ['$resource', '$http',
    function($resource, $http) {
        return {
            checkOngoingConf: function(meetingId) {
                return $http.get('chats/meeting/' + meetingId);
            },
            endConf: function(roomId, status) {
                return $http.put('chats/' + roomId + '/' + status);
            },
            getFriendList: function(){
                return $http.get('chats/friendList');
            },
            addMessage: function(to, message){
                return $http.post('chats/messages', {to: to, message: message});
            },
            getMessages: function(participant){
                return $http.get('chats/messages/' + participant);
            }
        };
    }
]);
