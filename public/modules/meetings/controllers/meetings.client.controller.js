'use strict';

// Meetings controller
angular.module('meetings').controller('MeetingsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Meetings', '$modal', 'MeetingHelper', '$rootScope', '$timeout', 'Validator', 'ProjectHelper', 'socket',
    function($scope, $stateParams, $location, Authentication, Meetings, $modal, MeetingHelper, $rootScope, $timeout, Validator, ProjectHelper, socket) {
        $scope.authentication = Authentication;
        $scope.user = window.user;

        // Create new Meeting


        // Remove existing Meeting
        $scope.remove = function(meeting) {
            if (meeting) {
                meeting.$remove();

                for (var i in $scope.meetings) {
                    if ($scope.meetings[i] === meeting) {
                        $scope.meetings.splice(i, 1);
                    }
                }
            } else {
                $scope.meeting.$remove(function() {
                    $location.path('meetings');
                });
            }
        };

        // Update existing Meeting
        $scope.update = function() {
            var meeting = $scope.meeting;

            meeting.$update(function() {
                $scope.message = 'Saved';
                $timeout(function() {
                    $scope.message = '';
                }, 2000);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Update existing Meeting
        $scope.updateOnDrag = function(event) {
            var meeting = new Meetings({
                _id: event._id,
                // name: event.name,
                // type: event.type,
                // isAllDay: event.allDay,
                // sprint: event.sprint,
                startDate: moment(event.start)
            });
            if (!Validator.isUndefinedKey(event, 'end')) {
                meeting.endDate = event.end;
            }

            meeting.$update(function(res) {
                console.log(res);
            }, function(err) {
                console.log(err);
            });
        };

        // Find a list of Meetings
        $scope.find = function() {
            $scope.meetings = Meetings.query();
        };
        var getByProject = function() {
            if (Validator.isUndefinedKey($rootScope, 'currentProject'))
                return;

            var curProject = $rootScope.currentProject._id;

            MeetingHelper.getByProject(curProject).then(function(res) {
                for (var j in res.data) {
                    var meeting = res.data[j];

                    var event = {
                        id: meeting._id,
                        sprint: meeting.sprint,
                        title: meeting.name,
                        start: new Date(meeting.startDate),
                        allDay: meeting.isAllDay
                    };
                    if (!Validator.isUndefinedKey(meeting, 'endDate'))
                        event.end = new Date(meeting.endDate);

                    $scope.events.push(event);

                }

            }, function(err) {
                console.log(err);
            });
        };
        this.getByProject = function() {
            ProjectHelper.getCurrentProject(getByProject);
        };

        // Find existing Meeting
        $scope.findOne = function() {
            $scope.meeting = Meetings.get({
                meetingId: $stateParams.meetingId
            }, function(res){
                $scope.timebox = moment.duration(res.timebox, 'minutes').humanize();
            });
        };
        var today = new Date();
        $scope.greaterThan = function(prop) {
            var startDate = new Date(prop.start);
            if (startDate.getDate() >= today.getDate() && startDate.getMonth() >= today.getMonth() && startDate.getFullYear() >= today.getFullYear())
                return true;
            else
                return false;
        };


        // $scope.eventSource = {
        //     url: "http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic",
        //     className: 'gcal-event', // an option!
        //     currentTimezone: 'America/Chicago' // an option!
        // };

        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();
        $scope.events = [];

        $scope.eventSources = [$scope.events];

        $scope.changeView = function(view) {
            $scope.myCalendar.fullCalendar('changeView', view);
        };
        $scope.today = function() {
            $scope.myCalendar.fullCalendar('today');
        };
        $scope.next = function() {
            $scope.myCalendar.fullCalendar('next');
        };
        $scope.prev = function() {
            $scope.myCalendar.fullCalendar('prev');
        };
        $scope.remove = function(index) {
            $scope.events.splice(index, 1);
        };
        $scope.addEvent = function() {
            $scope.events.push({
                title: 'Open Sesame',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                className: ['openSesame']
            });
        };
        $scope.addRemoveEventSource = function(sources, source) {
            var canAdd = 0;
            angular.forEach(sources, function(value, key) {
                if (sources[key] === source) {
                    sources.splice(key, 1);
                    canAdd = 1;
                }
            });
            if (canAdd === 0) {
                sources.push(source);
            }
        };
        $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view) {
            console.log(event, delta, revertFunc, jsEvent, ui, view);
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };
        $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view) {

            console.log(delta);
            $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
        };
        $scope.onEventClick = function(event, jsEvent, revertFunc) {
            // console.log(event);
            Meetings.get({
                meetingId: event._id
            }, function(meeting) {
                $scope.showModal(false, meeting);
            });
        };

        $scope.showModal = function(isNew, event) {
            var isNewMeeting = isNew;
            var modalInstance = $modal.open({
                templateUrl: 'modules/meetings/views/create-meeting.client.view.html',
                controller: 'MeetingModalController',
                controllerAs: 'meeting',
                backdrop: 'static',
                resolve: {
                    event: function() {
                        if (Validator.isUndefined(event))
                            return {};
                        return event;
                    },
                    isNew: function() {
                        return isNewMeeting;
                    }
                }
            });

            modalInstance.result.then(function(item) {
                var k = -1;
                var events = $scope.events;
                for (var i = 0; i < events.length; i++) {
                    if (item._id === events[i]._id) {
                        k = i;
                        break;
                    }
                }
                if (k >= 0 && !Validator.isUndefinedKey(item, 'deleted')) {
                    console.log($scope.events);
                    $scope.events.splice(k, 1);
                    return;
                }
                // var moment = moment(item.startDate),
                // date = moment.date();
                var event = {
                    id: item._id,
                    title: item.name,
                    start: new Date(item.startDate),
                    allDay: item.isAllDay
                };
                if (!Validator.isUndefinedKey(item, 'endDate')) {
                    event.end = item.endDate;
                }

                if (k >= 0)
                    $scope.events[k] = event;
                else
                    $scope.events.push(event);
            }, function() {
                // console.log('Modal dismissed at: ' + new Date());
            });
        };
        $scope.uiConfig = {
            calendar: {
                height: 450,
                editable: true,
                header: {
                    left: 'title',
                    center: '',
                    right: ''
                },
                eventClick: $scope.onEventClick,
                dayClick: function() {
                    console.log('dayClick');
                },
                eventDrop: $scope.updateOnDrag,
                eventResize: $scope.updateOnDrag,
                eventRender: function() {
                    // console.log('eventRender');
                }
            }
        };

        $scope.eventClick = function(event) {
            var $this = $(event.currentTarget);
            $timeout(function() {
                $this.find('a:first').trigger('click');
            }, 0);

        };

        $scope.wysiwygCustomMenu = [
            ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript'],
            ['font-size'],
            // ['font-color', 'hilite-color'],
            ['remove-format'],
            ['ordered-list', 'unordered-list', 'outdent', 'indent'],
            ['left-justify', 'center-justify', 'right-justify'],
            ['code', 'quote', 'paragragh'],
            ['link', 'image']
        ];

        $scope.reportChanged = function() {
            if ($stateParams.meetingId) {
                var data = {
                    meetingId: $stateParams.meetingId,
                    report: $scope.meeting.report,
                    username: user.displayName
                };
                socket.emit('reportChanged', data);
            }
        };
        var timeout;
        $scope.$on('socket:reportChanged', function(event, data) {
            $scope.meeting.report = data.report;
            $scope.typing = data.username + ' is typing...';
            $timeout.cancel(timeout);
            timeout = $timeout(function() {
                $scope.typing = '';
            }, 1500);
        });

        var replay = $('#replay'),
            replayVideoEle = replay.find('video')[0];
        $scope.playrecorded = function(URL, $event){
            var target = $($event.target);
            if(target.hasClass('fa'))
                return;
            target = $($event.currentTarget).find('.notification-messages');
            var others = $($event.currentTarget).parent().find('.notification-messages');

            if(target.hasClass('playing')){
                replayVideoEle.pause();
                replay.hide();
                others.removeClass('playing');

            } else {
                others.removeClass('playing');
                target.addClass('playing');
                replay.show();
                replayVideoEle.src = URL;
                replayVideoEle.play();
                
            }
        };
        $scope.delRecorded = function(id){
            MeetingHelper.delRecorded(id).then(function(payload){
                if(payload.data) {
                    var meetingId = $stateParams.meetingId;
                    console.log(meetingId);
                    var data = {
                        meetingId: meetingId,
                        recordedId: id
                    };
                    socket.emit('delRecorded', data);                    
                }
            });
        };

        $scope.$on('socket:newRecorded', function(event, data){
            if(user._id !== data.newRecorded.user._id)
                $scope.meeting.recordedVideos.push(data.newRecorded);
        });
        $scope.$on('socket:delRecorded', function(event, data){
            var index = _.findIndex($scope.meeting.recordedVideos, function(recorded){
                    return recorded._id === data.recordedId;
                });
            if(index !== -1) {
                $scope.meeting.recordedVideos.splice(index, 1);
                replayVideoEle.pause();
            }
        });

    }
]);
