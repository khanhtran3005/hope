'use strict';

angular.module('meetings').factory('MeetingHelper', ['$http',
    function($http) {
        // Meetinghelper service logic
        // ...

        // Public API
        return {
            getByProject: function(projectId) {
                return $http.get('/meetings/list/' + projectId + '/project');
            },
            getBySprint: function(sprintId) {
                return $http.get('/meetings/list/' + sprintId + '/sprint');
            },
            uploadVideos: function(data, meetingId){
                return $http.put('/meetings/uploadVideos/' + meetingId, data);
            },
            delRecorded: function(recordedId){
                return $http.delete('/recorded/' + recordedId);
            },
            addConfMessage: function(meetingId, data){
                return $http.post('/meetings/ConfMessage/' + meetingId, data);
            }
        };
    }
]);
