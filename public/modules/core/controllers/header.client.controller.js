'use strict';

angular.module('core').controller('HeaderController', ['$scope', 'Authentication', 'Menus', 'ProjectHelper', '$rootScope', '$window', '$state', '$timeout', 'toaster',
    function($scope, Authentication, Menus, ProjectHelper, $rootScope, $window, $state, $timeout, toaster) {

        var that = this;
        $window.chatInitFlag = false;
        $scope.authentication = Authentication;
        $scope.isCollapsed = false;
        $scope.menu = Menus.getMenu('topbar');
        this.user = user;
        $scope.initMenu = function() {
            initMainMenu();
        };
        this.totalProject = 0;
        // this.chatToggle = chatToggle();
        // this.taskList = function(event) {
        //     taskList(event);
        // };
        // var navClicked = false;
        this.sidebar = function(event) {
            navigation(event);
        };
        $scope.countProject = function() {
            if (!Authentication.user) {
                $state.go('signin');
                return;
            }

            ProjectHelper.countProject().then(
                function(payload) {
                    that.totalProject = payload.data.total;
                },
                function(err) {
                    console.log(err);
                });
        };
        $scope.toggleCollapsibleMenu = function() {
            $scope.isCollapsed = !$scope.isCollapsed;
        };

        $scope.user = user;
        $scope.totalSocialAccount = _.keys(user.additionalProvidersData).length;

        // function taskList(event) {
        //     var $this = $(event.currentTarget);
        //     var contents = $('#notification-list').html();
        //     $this.popover({
        //         html: true,
        //         content: function() {
        //             return contents;
        //         }
        //     });
        // }

        this.chatToggle = function() {
            $('.chat-menu-toggle').sidr({
                name: 'sidr',
                side: 'right',
                complete: function() {}
            });
            $('.simple-chat-popup').click(function() {
                $(this).addClass('hide');
                $('#chat-message-count').addClass('hide');
            });

            $timeout(function(){
                $('.chat-back').trigger('click');
            }, 0);

            $rootScope.$broadcast('rootScope:clearParticipant');
        };
        $window.isChatLoaded = false;
        if (!$window.isChatLoaded)
            that.chatToggle();

        $window.isChatLoaded = true;

        
       



        function navigation(event) {
            var $this = $(event.currentTarget);

            if ($this.next().hasClass('sub-menu') === false) {
                return;
            }

            var parent = $this.parent().parent();

            parent.children('li.open').children('a').children('.arrow').removeClass('open');
            parent.children('li.open').children('.sub-menu').slideUp(200);
            parent.children('li.open').removeClass('open');

            var sub = $this.next();
            if (sub.is(':visible')) {
                jQuery('.arrow', $this).removeClass('open');
                $this.parent().removeClass('open');
                sub.slideUp(200, function() {
                    handleSidenarAndContentHeight();
                });
            } else {
                jQuery('.arrow', $this).addClass('open');
                $this.parent().addClass('open');
                sub.slideDown(200, function() {
                    handleSidenarAndContentHeight();
                });
            }
        }

        function initMainMenu() {
            var eleHeight = window.innerHeight - 105;
            if (!(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {
                $('#main-menu-wrapper').slimScroll({
                    color: '#a1b2bd',
                    size: '4px',
                    height: eleHeight,
                    alwaysVisible: false
                });
            }

        }

        function handleSidenarAndContentHeight() {
            var content = $('.page-content');
            var sidebar = $('.page-sidebar');

            if (!content.attr('data-height')) {
                content.attr('data-height', content.height());
            }

            if (sidebar.height() > content.height()) {
                content.css('min-height', sidebar.height() + 120);
            } else {
                content.css('min-height', content.attr('data-height'));
            }
        }

    }
]);
