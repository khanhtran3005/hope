'use strict';

module.exports = {
    app: {
        title: 'HOPE',
        description: 'HOPE is a web application for process management based on SCRUM methodology',
        keywords: 'Scrum, management, kanban'
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions',
    domainNameForCron: 'http://localhost',
    assets: {
        lib: {
            css: [
                'public/lib/pace/themes/pace-theme-flash.css',
                'public/assets/plugins/jquery-slider/css/jquery.sidr.dark.css',
                // 'public/lib/sidr/stylesheets/jquery.sidr.light.css',
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                // 'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                'public/lib/font-awesome/css/font-awesome.css',
                'public/assets/css/animate.min.css',
                'public/lib/select2/select2.css',
                'public/assets/css/responsive.css',
                'public/assets/css/custom-icon-set.css',
                'public/assets/css/hope-icon-font.css',
                'public/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                'public/lib/fullcalendar/fullcalendar.css',
                'public/lib/angular-ui-select/dist/select.css',
                'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
                'public/lib/angularjs-toaster/toaster.css',
                'public/lib/nvd3/nv.d3.min.css',
                'public/assets/css/style.css',
                'public/assets/css/custom.css',
                'public/assets/css/hope.css'

            ],
            signin_css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/font-awesome/css/font-awesome.css',
                'public/assets/css/login.css',
                'public/assets/css/components.css'

            ],
            signin_js: [
                'public/lib/jquery/dist/jquery.js',
                'public/lib/bootstrap/dist/js/bootstrap.js',
                'public/assets/js/login.js',
                'public/assets/js/jquery.validate.min.js',
                'public/lib/angular/angular.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/auth/config.js',
                'public/auth/application.js',
                'public/auth/users/*.js',
                'public/auth/users/*[!tests]*/*.js',

            ],
            js: [
                // <!-- BEGIN CORE JS FRAMEWORK--> 
                'public/lib/jquery/dist/jquery.js',
                'public/lib/jquery-ui/jquery-ui.js',
                'public/lib/bootstrap/dist/js/bootstrap.js',
                'public/lib/breakpoints/breakpoints.js',
                'public/lib/unveil/jquery.unveil.js',
                'public/lib/blockui/jquery.blockUI.js',
                'public/lib/moment/min/moment.min.js',
                'public/lib/socket.io-client/socket.io.js',
                // <!-- END CORE JS FRAMEWORK --> 

                // <!-- BEGIN BANK PAGE JS FRAMEWORK-->
                // 'public/lib/sidr/jquery.slider.js',
                'public/lib/smart-time-ago/lib/timeago.js',
                'public/assets/plugins/jquery-slider/jquery.sidr.min.js',
                'public/lib/slimscroll/jquery.slimscroll.js',
                'public/lib/pace/pace.js',
                'public/lib/jquery-animate-numbers/jquery.animateNumbers.js',
                'public/assets/js/core.js',
                'public/lib/bootstrap-daterangepicker/daterangepicker.js',
                'public/lib/fullcalendar/fullcalendar.min.js',
                // 'public/lib/fullcalendar/gcal.js',
                'public/lib/lodash/dist/lodash.min.js',
                'public/assets/js/RTCMultiConnection.min.js',
                'public/assets/js/signaler.js',
                'public/assets/js/FileBufferReader.js',
                // 'public/lib/SimpleWebRTC/latest.js',
                // 'public/assets/js/demo.js',
                // <!-- END BANK PAGE JS FRAMEWORK--> 

                // <!-- BEGIN JS ANGULAR--> 
                'public/lib/angular/angular.js',
                'public/lib/d3/d3.min.js',
                'public/lib/nvd3/nv.d3.min.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-touch/angular-touch.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/angular-smart-timeago/src/angular-smart-timeago.js',
                'public/lib/angular-dragdrop/src/angular-dragdrop.js',
                'public/lib/angular-ui-select/dist/select.js',
                'public/lib/ng-bs-daterangepicker/src/ng-bs-daterangepicker.js',
                'public/lib/angular-ui-calendar/src/calendar.js',
                'public/lib/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
                'public/lib/angular-socket-io/socket.min.js',
                'public/lib/angularjs-toaster/toaster.js',
                'public/lib/ng-file-upload/angular-file-upload.min.js',
                'public/lib/angular-wysiwyg/angular-wysiwyg.js',
                'public/lib/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.js',
                'public/lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
                'public/lib/angular-nvd3/dist/angular-nvd3.min.js',
                'public/lib/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js'

        // <!-- END JS ANGULAR--> 
      ]
    },
    css: [
      'public/modules/**/css/*.css'
    ],
    js: [
      'public/config.js',
      'public/application.js',
      'public/interceptors/http.interceptor.js',
      // 'public/interceptors/loading.interceptor.js',
      'public/modules/*/*.js',
      'public/modules/*/*[!tests]*/*.js'
    ],
    tests: [
      'public/lib/angular-mocks/angular-mocks.js',
      'public/modules/*/tests/*.js'
    ]
  }
};
