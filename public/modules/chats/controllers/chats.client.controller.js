'use strict';

// Chats controller
angular.module('chats').controller('ChatsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Chats', 'socket', '$rootScope', 'ChatHelper', '$window', '$timeout',
    function($scope, $stateParams, $location, Authentication, Chats, socket, $rootScope, ChatHelper, $window, $timeout) {
        $scope.authentication = Authentication;

        // Create new Chat
        $scope.create = function() {
            // Create new Chat object
            var chat = new Chats({
                name: this.name
            });

            // Redirect after save
            chat.$save(function(response) {
                $location.path('chats/' + response._id);

                // Clear form fields
                $scope.name = '';
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Remove existing Chat
        $scope.remove = function(chat) {
            if (chat) {
                chat.$remove();

                for (var i in $scope.chats) {
                    if ($scope.chats[i] === chat) {
                        $scope.chats.splice(i, 1);
                    }
                }
            } else {
                $scope.chat.$remove(function() {
                    $location.path('chats');
                });
            }
        };

        // Update existing Chat
        $scope.update = function() {
            var chat = $scope.chat;

            chat.$update(function() {
                $location.path('chats/' + chat._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Chats
        $scope.find = function() {
            $scope.chats = Chats.query();
        };

        // Find existing Chat
        $scope.findOne = function() {
            $scope.chat = Chats.get({
                chatId: $stateParams.chatId
            });
        };
        $scope.friendList = [];
        $scope.friendListFunc = function() {
            ChatHelper.getFriendList().then(function(friendList) {
                if(friendList.data.length === 0)
                    return;
                $scope.friendList = friendList.data;
                $timeout(function() {
                    handleChat();
                }, 1000);

            });
        };
        $scope.participant = '';
        $scope.changeParticipant = function(participant) {
            $scope.participant = participant;
        };

        $scope.$on('socket:newMessage', function(event, data) {
            var chatSideBar = $('.chat-window-wrapper');
            var isOpen = chatSideBar.css('right') === '0px' ? true : false;
            var message = data.message;
            var userEle = $('.user-details-wrapper[data-user-id="' + data.from + '"]');

            if (isOpen) {
                if ($scope.participant === '')
                return;
                var userProfileURL = userEle.find('.user-profile img').attr('src');
                build_conversation(message, true, userProfileURL, userProfileURL);
                scrollBottom();
            } else {
                // var userEle = $('.user-details-wrapper[data-user-id="' + data.from + '"]'),
                //     from = userEle.find('.user-name').text().trim();
                var from = userEle.find('.user-name').text().trim();

                var clickHandler = function(){
                    $timeout(function(){
                        $('#chat-menu-toggle').trigger('click');
                        $timeout(function(){
                            userEle.trigger('click');
                        }, 500);
                        
                    });
                };
                var toastData = {
                    type: 'info',
                    title: from,
                    body: data.message,
                    clickHandler: clickHandler
                };
                $rootScope.$broadcast('rootScope:toaster', toastData);
            }
        });

        $scope.$on('rootScope:clearParticipant', function(event, data) {
            $scope.participant = '';
        });

        function handleChat() {
            var messagesWrapper = $('#messages-wrapper');
            $('.user-details-wrapper').click(function() {
                $('.chat-messages').empty();
                ChatHelper.getMessages($scope.participant).then(function(payload) {
                    var data = payload.data;
                    data.forEach(function(message) {
                        if (message.from._id === user._id) {
                            build_conversation(message.message, false);
                        } else {
                            build_conversation(message.message, true, message.from.profileURL, message.from.profileURL);
                        }
                    });
                    scrollBottom();
                });
                set_user_details($(this).attr('data-user-name'), $(this).attr('data-chat-status'));
                messagesWrapper.addClass('animated');
                messagesWrapper.show();
                $('#chat-users').removeClass('animated');
                $('#chat-users').hide();
                $('.chat-input-wrapper').show();
            });

            $('.chat-back').click(function() {
                var messagesWrapper = $('#messages-wrapper');
                messagesWrapper.find('.chat-messages-header .status').removeClass('online');
                messagesWrapper.find('.chat-messages-header .status').removeClass('busy');
                messagesWrapper.hide();
                messagesWrapper.removeClass('animated');
                $('#chat-users').addClass('animated');
                $('#chat-users').show();
                $('.chat-input-wrapper').hide();
                //clear participant
                $scope.participant = '';
            });
            $('#main-chat-wrapper').on('click', '.bubble', function() {
                $(this).parent().parent('.user-details-wrapper').children('.sent_time').slideToggle();
            });
            $('#chat-message-input').keypress(function(e) {
                if (e.keyCode == 13 && e.shiftKey) {
                    return true;
                }
                if (e.keyCode === 13) {
                    e.preventDefault();
                    var message = $(this).val().replace(/\n/g, '<br/>').trim();
                    if (message === '') {
                        $(this).val('');
                        return;
                    }
                    build_conversation(message, false);
                    scrollBottom();
                    var data = {
                        message: message,
                        to: $scope.participant
                    };
                    socket.emit('sendMessage', data);
                    $(this).val('');

                }
            });
            $(window).setBreakpoints({
                distinct: true,
                breakpoints: [
                    320,
                    480,
                    768,
                    1024
                ]
            });
            var eleHeight = window.screen.height;
            eleHeight = eleHeight - 180;

            $(window).setBreakpoints({
                distinct: true,
                breakpoints: [
                    320,
                    480,
                    768,
                    1024
                ]
            });
            //Break point entry 
            $(window).bind('enterBreakpoint320', function() {
                eleHeight = eleHeight - 20;
            });

            $(window).bind('enterBreakpoint480', function() {
                eleHeight = eleHeight - 20;
            });

            $('#main-chat-wrapper').slimScroll({
                color: '#a1b2bd',
                size: '7px',
                height: eleHeight,
                alwaysVisible: false,
                start: 'bottom'
            });
        }

        function scrollBottom() {
            var scrollTo_val = $('.chat-messages').height();
            $('#main-chat-wrapper').slimScroll({
                scrollTo: scrollTo_val
            });
        }


        function set_user_details(username, status) {
            var messagesWrapper = $('#messages-wrapper');
            messagesWrapper.find('.chat-messages-header .status').addClass(status);
            messagesWrapper.find('.chat-messages-header span').text(username);
        }

        function build_conversation(msg, isOpponent, img, retina) {
            var time = moment().format('HH:mm YYYY-MM-DD');
            if (isOpponent) {
                var opponent = '';
                opponent += '<div class=\"user-details-wrapper \">';
                opponent += '<div class=\"user-profile\">';
                opponent += '<img src=\"' + img + '" alt=\"\" data-src=\"assets\/img\/profiles\/d.jpg\" data-src-retina=\"' + retina + '\" width=\"35\" height=\"35\">';
                opponent += '<\/div>';
                opponent += '<div class=\"user-details\">';
                opponent += '<div class=\"bubble\">';
                opponent += msg;
                opponent += '<\/div>';
                opponent += '<\/div>';
                opponent += '<div class=\"clearfix\"><\/div>';
                opponent += '<div class=\"sent_time off\">' + time + '<\/div>';
                opponent += '<\/div>';
                $('.chat-messages').append(opponent);
            } else {
                $('.chat-messages').append('<div class="user-details-wrapper animated fadeIn">' +
                    '<div class="user-details pull-right">' +
                    '<div class="bubble old sender">' +
                    msg +
                    '</div>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '<div class="sent_time" style="display: none;">' + time + '</div>' +
                    '</div>');
            }
        }

    }
]);
