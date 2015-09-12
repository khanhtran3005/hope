'use strict';

angular.module('chats').directive('livestream', ['Chats', 'socket', '$stateParams', 'ChatHelper', 'hopeUI', '$compile', 'MeetingHelper', '$modal',
  function(Chats, socket, $stateParams, ChatHelper, hopeUI, $compile, MeetingHelper, $modal) {
    return {
      templateUrl: '/modules/chats/views/livestream.client.view.html',
      restrict: 'EA',
      controller: function($scope) {
        //add [0] to get native DOM.
        var isFirefox = !!navigator.mozGetUserMedia;
        var mainVideo = $('.main-video')[0];
        var remoteDiv = $('#remotes');
        var localContainer = $('#local');
        var miniVideos = $('#mini-videos');
        var createConf = $('#create-call'),
          endConf = $('#end-call'),
          joinConf = $('#join-call'),
          shareFileConf = $('#share-file'),
          livestreamContainer = $('.livestream-container'),
          miniVideoClasses = 'mini col-md-3 no-padding',
          sessionIdForParticipantsJoinConf,
          sessionid,
          chatOutput = $('#chat-container').find('.scroller'),
          chatInput = $('#input-text-chat'),
          belowChatInput = $('#chat-container').find('.row-fluid'),
          uploading = $('#uploading'),
          fileToUpload = 0,
          meetingId = $stateParams.meetingId;

        // initializing RTCMultiConnection constructor.
        $scope.connection = {};
        $scope.signaler = {};
        $scope.checkOngoingConf = function() {
          ChatHelper.checkOngoingConf(meetingId).then(function(res) {
            if (!res.data.isExist) {
              createConf.removeClass('hide');
              joinConf.addClass('hide');
            } else {
              joinConf.removeClass('hide');
              createConf.addClass('hide');
              sessionIdForParticipantsJoinConf = res.data.SDP._id;
            }
            //handle chat box;
            hopeUI.initSlimscroll({
              start: 'bottom',
              alwaysVisible: true,
              railVisible: true
            });
          });

          //subscribe to meeting
          if (meetingId)
            socket.emit('subscribe', {
              meetingId: meetingId
            });
        };
        $scope.newConf = function() {
          $scope.connection = new RTCMultiConnection(meetingId);
          $scope.connection.session = {
            audio: true,
            video: true,
            data: true
          };
          $scope.connection.log = false;
          $scope.connection.sdpConstraints.mandatory = {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true,
            VoiceActivityDetection: true,
            IceRestart: true
          };

          $scope.connection.candidates = {
            relay: true,
            reflexive: true,
            host: false
          };

          var videoConstraints = {
            mandatory: {
              maxWidth: 1920,
              maxHeight: 1080,
              minAspectRatio: 1.77,
              minFrameRate: 3,
              maxFrameRate: 64
            },
            optional: []
          };

          var audioConstraints = {
            mandatory: {
              googEchoCancellation: false,
              googAutoGainControl: false,
              googNoiseSuppression: false,
              googHighpassFilter: false
            },
            optional: []
          };

          $scope.connection.mediaConstraints = {
            video: videoConstraints,
            audio: audioConstraints
          };

          $scope.connection.onSessionClosed = function(session) {
            if (session.isEjected) {
              alert('You was ejected by conference moderator.');
            }
            reset();

          };

          $scope.signaler = initReliableSignaler($scope.connection, socket);

          $scope.connection.onspeaking = function(e) {
            var ele = $('#' + e.streamid);
            ele.addClass('speaking');

          };
          $scope.connection.onsilence = function(e) {
            var ele = $('#' + e.streamid);
            ele.removeClass('speaking');
          };

          $scope.connection.onstream = function(e) {

            if ($('#' + e.streamid).length >= 1)
              return;

            var miniVideoWrapper = $('<div/>'),
              recordBtn = $('<a/>', {
                href: 'javascript:;'
              });

            miniVideoWrapper.addClass('mini-video-wrapper');
            recordBtn.addClass('record-btn');
            recordBtn.html('<i class="fa fa-camera"></i>');
            recordBtn.attr('data-streamid', e.streamid);
            miniVideoWrapper.append(recordBtn);

            var video = document.createElement('video');

            video.id = e.streamid;
            video.src = e.blobURL;
            video.className = miniVideoClasses;
            $(video).attr('data-userid', e.userid);
            //append mini video to video wrapper
            miniVideoWrapper.append(video);

            if (e.type == 'local') {
              mainVideo.src = e.blobURL;
              $(mainVideo).attr('data-streamid', e.streamid);
              $(mainVideo).next().attr('data-streamid', e.streamid);

              video.muted = true;

              //append minivideo to local
              localContainer.append(miniVideoWrapper);

            } else if (e.type == 'remote') {
              remoteDiv.prepend(miniVideoWrapper);
            }

            video.play();
            changeMainVideo();
            recordVideo();
          };
          $scope.connection.onFileStart = function(file) {
            $scope.progress = 0;
            belowChatInput.append($compile('<progressbar animate="true" value="progress" id="' + file.uuid + '" type="success"><b>{{progress}}%</b></progressbar>')($scope));
            $scope.$apply();
          };

          $scope.connection.onFileProgress = function(chunk) {

            $scope.progress = Math.round(chunk.currentPosition / chunk.maxChunks * 100 * 10) / 10;
          };

          $scope.connection.onFileEnd = function(file) {
            $('#' + file.uuid).remove();
            belowChatInput.append('<a class="m-r-15" href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>');
          };

          $scope.connection.onleave = function(e) {
            var video = $('[data-userid="' + e.userid + '"]');
            video.parents('.mini-video-wrapper').remove();
          };

          $scope.connection.onstreamended = function(e) {
            $(e.mediaElement).parents('.mini-video-wrapper').remove();
          };

          $scope.connection.onmessage = appendDIV;
        };
        //end newConf func

        //listen on a conference was create in a meeting
        $scope.$on('socket:createdConf', function(event, data) {
          if ($scope.connection.sessionid)
            return;
          sessionIdForParticipantsJoinConf = data.sessionid;
          createConf.addClass('hide');
          joinConf.removeClass('hide');
        });

        $scope.$on('socket:endedConf', function(){
          createConf.removeClass('hide');
          joinConf.addClass('hide');
          endConf.addClass('hide');
        });




        // using reliable-signaler

        createConf.click(function() {
          $scope.newConf();
          /*switch Conference*/
          $(this).addClass('hide');
          endConf.removeClass('hide');
          /*------------------*/
          var chat = new Chats({
            meeting: meetingId
          });
          chat.$save(function(response) {
            sessionid = response._id;
            if (!user._id)
              return alert('You need login first');
            $scope.connection.userid = user._id;
            // $scope.connection.channel = $scope.connection.sessionid = sessionid;
            // $scope.connection.sessionid = sessionid;
            $scope.connection.open({
              sessionid: sessionid,
              onMediaCaptured: function() {
                $scope.signaler.createNewRoomOnServer($scope.connection.sessionid);
                //inform a conference was created
                socket.emit('new-room', {
                  roomid: sessionid,
                  meetingId: meetingId
                });
                livestreamContainer.addClass('active');
              }
            });

          }, function(err) {
            alert(err);
          });

        });

        joinConf.click(function() {
          $scope.newConf();
          sessionid = sessionIdForParticipantsJoinConf;

          if (sessionid === undefined) {
            alert('session for participants is not defined');
            return;
          }
          // this.disabled = true;
          var data = {
            roomid: sessionid,
            userId: user._id
          };
          $scope.signaler.getRoomFromServer(data, function(data) {
            if (data.hasOwnProperty('error')) {
              console.log('Can not find this room');
              return;
            }

            // $scope.connection.channel = $scope.connection.sessionid = data.sessionid;
            // $scope.connection.sessionid = data.sessionid;
            $scope.connection.join({
              sessionid: data.sessionid,
              userid: data.moderatorid,
              session: $scope.connection.session
            });
            //inform a conference was created
            socket.emit('subscribeToRoom', {
              roomid: sessionid
            });
            //UI handle
            endConf.removeClass('hide');
            joinConf.addClass('hide');
            livestreamContainer.addClass('active');
          });
        });

        endConf.click(function() {
          if ($scope.connection.isInitiator) {
            $scope.connection.close();
            ChatHelper.endConf(sessionid, 2);
            socket.emit('endedConf', {meetingId: meetingId});
            reset();
          } else {
            $scope.connection.leave();
            reset(true);
          }
        });

        function reset(isParticipant) {
          $scope.connection = {};
          $scope.signaler = {};

          if (isParticipant) {
            joinConf.removeClass('hide');
            createConf.addClass('hide');
          } else {
            joinConf.addClass('hide');
            createConf.removeClass('hide');
          }
          endConf.addClass('hide');
          shareFileConf.addClass('hide');

          livestreamContainer.removeClass('active');
          $('.mini-video-wrapper').remove();

          mainVideo.src = '';
          mainVideo.pause();
        }

        shareFileConf.click(function() {
          var fileSelector = new FileSelector();
          fileSelector.selectSingleFile(function(file) {
            $scope.connection.send(file);
          });
        });


        // var progressHelper = {};

        $scope.progress = 0;

        function recordVideo() {
          var recordBtn = $('.record-btn');
          recordBtn.unbind('click').bind('click', function(e) {
            console.log('recording');
            var $this = $(this),
              streamid = $this.attr('data-streamid');
            if ($this.hasClass('recording')) {
              //handle stop
              $this.removeClass('recording');
              stopRecording(streamid);
            } else {
              //handle record
              $this.addClass('recording');
              startRecording(streamid);
            }

          });
        }

        function startRecording(streamid) {
          if (!isFirefox) {
            $scope.connection.streams[streamid].startRecording({
              audio: true,
              video: true
            });
          } else {
            $scope.connection.streams[streamid].startRecording({
              audio: true
            });
          }

        }

        function stopRecording(streamid) {
          var recordedVideosEle = $('#recorded-videos').find('.controls'),
            stream = $scope.connection.streams[streamid];

          stream.stopRecording(function(blob) {

            var modalInstance = $modal.open({
              templateUrl: 'modules/meetings/views/shared/_confirm-upload.modal.html',
              controller: 'ConfirmUploadModalController',
              size: 'sm'
            });
            modalInstance.result.then(function(result) {
              if (result.upload) {
                stream.audioRecorder.getDataURL(function(audioDataURL) {
                  if (!isFirefox) {
                    stream.videoRecorder.getDataURL(function(videoDataURL) {
                      uploadFiles(audioDataURL, videoDataURL, result.title);
                    });
                  } else uploadFiles(audioDataURL, null, result.title);
                });
              }
            });
          });
        }

        function uploadFiles(audioDataURL, videoDataURL, title) {
          var fileName = getRandomString(),
            files = {};
          files.title = title;
          uploading.show();
          fileToUpload += 1;

          files.audio = {
            name: fileName + (isFirefox ? '.webm' : '.wav'),
            type: isFirefox ? 'video/webm' : 'audio/wav',
            contents: audioDataURL
          };
          if (!isFirefox) {
            files.video = {
              name: fileName + '.webm',
              type: 'video/webm',
              contents: videoDataURL
            };
          }

          files.isFirefox = isFirefox;
          var data = {
            files: JSON.stringify(files)
          };
          MeetingHelper.uploadVideos(data, meetingId).then(function(payload) {
            fileToUpload -= 1;
            if (fileToUpload === 0) {
              uploading.hide();
            }
            var data = payload.data;
            $scope.meeting.recordedVideos.push(data);
            $('#replay').removeAttr('style').hide();

            emitToOthers({
              meetingId: meetingId,
              newRecorded: data
            });
          });
        }

        function emitToOthers(data) {
          socket.emit('newRecorded', data);
        }

        function getRandomString() {
          if (window.crypto) {
            var a = window.crypto.getRandomValues(new Uint32Array(3)),
              token = '';
            for (var i = 0, l = a.length; i < l; i++) token += a[i].toString(36);
            return token;
          } else {
            return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
          }
        }

        function changeMainVideo() {
          var videos = miniVideos.find('video');
          var $mainVideo = $(mainVideo);

          videos.unbind('click').bind('click', function(e) {
            var $this = $(this);
            if ($this.hasClass('active'))
              return;

            if ($this.hasClass('mini')) {
              var videos = miniVideos.find('video');
              mainVideo.src = $this[0].src;
              $(mainVideo).attr('data-streamid', $this[0].id);
              videos.removeClass('active');
              $this.addClass('active');
            }
          });
        }



        chatInput.keyup(function(e) {
          if (e.keyCode !== 13) return;

          // removing trailing/leading whitespace
          this.value = this.value.replace(/^\s+|\s+$/g, '');

          if (!this.value.length) return;
          var data = {
            message: this.value,
            username: user.displayName
          };
          $scope.connection.send(data);
          appendDIV(data);
          this.value = '';
        });



        // a custom method used to append a new DIV into DOM
        function appendDIV(event) {
          var isOwner = false,
            cmtClass,
            cmtContent = event.message || event.data.message,
            displayName = event.username || event.data.username,
            lastRow = chatOutput.find('.row:last').find('.grid'),
            lastUser = lastRow.find('.display-name').text().replace(/@/gi, '');

          if (lastUser === displayName) {
            var onlyContent = '<p class=\"cmt-content\">' + cmtContent + '<\/p>';
            lastRow.append(onlyContent);
          } else {
            if (user.displayName === event.username)
              isOwner = true;

            if (isOwner) {
              cmtClass = 'cmt-owner';
            } else {
              cmtClass = 'cmt-other';
            }
            var cmt = '';
            cmt += '<div class=\"row ' + cmtClass + '\">';
            cmt += '<div class=\"col-md-12\">';
            cmt += '<div class=\"grid simple vertical\">';
            cmt += '<p class=\"display-name\">@' + displayName;
            cmt += '<\/p>';
            cmt += '<p class=\"cmt-content\">' + cmtContent + '<\/p>';
            cmt += '<\/div>';
            cmt += '<\/div>';
            cmt += '<\/div>';

            chatOutput.append(cmt);
          }

          MeetingHelper.addConfMessage(meetingId, {message: cmtContent});

          chatInput.focus();
        }
        $scope.enterFullScreen = function(event) {
          var elem = event.currentTarget;
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
          } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
          } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          }
        };


      },
      link: function(scope, element, attrs) {

      }
    };
  }
]);
