'use strict';

ApplicationConfiguration.registerModule('RequestInterceptor');

angular.module('RequestInterceptor', [])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('requestInterceptor');
  })
  .factory('requestInterceptor', ['$q', '$location', 'toaster', '$rootScope', function($q, $location, toaster, $rootScope) {
    return {
      'request': function(config) {
        return config || $q.when(config);
      },
      'requestError': function(rejection) {
        return $q.reject(rejection);
      },
      'response': function(response) {
        return response || $q.when(response);
      },
      'responseError': function(rejection) {
        if (!angular.isUndefined(rejection.data)) {
          if (rejection.status == 500)
            toaster.pop('error', "System Error", 'Request Error!', 1500);
          else if (rejection.status == 404)
            toaster.pop('error', "System Error", 'Page Not Found!', 1500);
          else
            toaster.pop('warning', "Permission deny", rejection.data.message, 1500);
        } else {
          toaster.pop('error', "System Error", rejection.message, 1500);
        }
        return $q.reject(rejection);
      }
    }
  }]);
