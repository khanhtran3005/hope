'use strict';

module.exports = {
    db: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://localhost/hope-dev', //remember to change URI to production
    port: process.env.PORT || 80,
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
                'public/lib/font-awesome/css/font-awesome.min.css',
                'public/assets/css/animate.min.css',
                'public/lib/select2/select2.css',
                'public/assets/css/responsive.min.css',
                'public/assets/css/custom-icon-set.min.css',
                'public/assets/css/hope-icon-font.min.css',
                'public/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                'public/lib/fullcalendar/fullcalendar.css',
                'public/lib/angular-ui-select/dist/select.min.css',
                'public/lib/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
                'public/lib/angularjs-toaster/toaster.css',
                'public/lib/nvd3/nv.d3.min.css',
                'public/lib/pace/themes/pace-theme-flash.css',
                'public/assets/plugins/jquery-slider/css/jquery.sidr.dark.css',
                'public/assets/css/style.min.css',
                'public/assets/css/custom.min.css',
                'public/assets/css/hope.min.css',
                'public/lib/bootstrap/dist/css/application.min.css'
            ],
            js: [
                // <!-- BEGIN CORE JS FRAMEWORK--> 
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/jquery/jquery-migrate.js',
                'public/lib/jquery-ui/jquery-ui.js',
                'public/lib/bootstrap/dist/js/bootstrap.min.js',
                'public/lib/breakpoints/breakpoints.js',
                'public/lib/unveil/jquery.unveil.min.js',
                'public/lib/blockui/jquery.blockUI.js',
                'public/lib/moment/min/moment.min.js',
                'public/lib/socket.io-client/socket.io.js',
                // <!-- BEGIN BANK PAGE JS FRAMEWORK-->
                // 'public/lib/sidr/jquery.slider.js',
                'public/lib/smart-time-ago/lib/timeago.js',
                'public/assets/plugins/jquery-slider/jquery.sidr.min.js',
                'public/lib/slimscroll/jquery.slimscroll.js',
                'public/lib/pace/pace.js',
                'public/lib/jquery-animate-numbers/jquery.animateNumbers.js',
                'public/assets/js/core.min.js',
                'public/lib/bootstrap-daterangepicker/daterangepicker.js',
                'public/lib/fullcalendar/fullcalendar.min.js',
                'public/lib/lodash/dist/lodash.min.js',
                'public/assets/js/RTCMultiConnection.min.js',
                'public/assets/js/signaler.min.js',
                'public/assets/js/FileBufferReader.min.js',
                'public/lib/d3/d3.min.js',
                'public/lib/nvd3/nv.d3.min.js',
                // <!-- END BANK PAGE JS FRAMEWORK--> 
                'public/lib/angular/angular.min.js',
                'public/lib/angular-resource/angular-resource.min.js',
                'public/lib/angular-cookies/angular-cookies.min.js',
                'public/lib/angular-animate/angular-animate.min.js',
                'public/lib/angular-touch/angular-touch.min.js',
                'public/lib/angular-sanitize/angular-sanitize.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.min.js',
                'public/lib/angular-ui-utils/ui-utils.min.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',

                'public/lib/angular-smart-timeago/src/angular-smart-timeago.js',
                'public/lib/angular-dragdrop/src/angular-dragdrop.min.js',
                'public/lib/angular-ui-select/dist/select.min.js',
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
                'public/lib/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',

                'public/lib/angular-bootstrap/application.min.js'
            ],
            signin_css: [
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/font-awesome/css/font-awesome.css',
                'public/assets/css/login.css',
                'public/assets/css/components.css'

            ],
            signin_js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/bootstrap/dist/js/bootstrap.min.js',
                'public/assets/js/login.min.js',
                'public/assets/js/jquery.validate.min.js',
                'public/lib/angular/angular.min.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/auth/config.js',
                'public/auth/application.js',
                'public/auth/users/*.js',
                'public/auth/users/*[!tests]*/*.js',

            ],
        },
        css: 'public/dist/application.min.css',
        js: 'public/dist/application.min.js'
    },
    facebook: {
        clientID: process.env.FACEBOOK_ID || '1588176364747019',
        clientSecret: process.env.FACEBOOK_SECRET || '4908b897e272effdbba7ce562f071727',
        callbackURL: 'http://128.199.96.46/auth/facebook/callback'
    },
    twitter: {
        clientID: process.env.TWITTER_KEY || 'g5BWVE0xKjCvRfBzuUg2pfeR9',
        clientSecret: process.env.TWITTER_SECRET || '0hIKUzho5SMNsxU601MutWg5IqV7gXpcF0TlE8LUxjyKU2U8qH',
        callbackURL: 'http://128.199.96.46/auth/twitter/callback'
    },
    google: {
        clientID: process.env.GOOGLE_ID || '1088147031700-7pmsft5k8m84levqtoeosnqusf7vifm9.apps.googleusercontent.com',
        clientSecret: process.env.GOOGLE_SECRET || 'wZl9Xah4iJfU69dRJMNjjJTm',
        callbackURL: 'http://128.199.96.46/auth/google/callback'
    },
    linkedin: {
        clientID: process.env.LINKEDIN_ID || 'APP_ID',
        clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
        callbackURL: 'http://128.199.96.46/auth/linkedin/callback'
    },
    github: {
        clientID: process.env.GITHUB_ID || 'APP_ID',
        clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
        callbackURL: 'http://128.199.96.46/auth/github/callback'
    },
    mailer: {
        from: process.env.MAILER_FROM || 'HOPE Robot',
        options: {
            service: process.env.MAILER_SERR || 'Gmail',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'beprojectsp@gmail.com',
                pass: process.env.MAILER_PASSWORD || '12345678toi'
            }
        }
    }
};
