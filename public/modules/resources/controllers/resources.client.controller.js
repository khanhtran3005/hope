'use strict';

// Resources controller
angular.module('resources').controller('ResourcesController', ['$window', '$scope', '$stateParams', '$location', 'Authentication', 'Resources', '$http', '$upload',
  function($window, $scope, $stateParams, $location, Authentication, Resources, $http, $upload) {
    $scope.authentication = Authentication;

    $scope.upload = function(attachment) {
      var focus = $window.focus;
      if (!angular.isUndefined(attachment) && attachment.toString() !== '') {
        var fd = new FormData();
        fd.append('attachment', attachment[0]);
        fd.append('tbl', focus.tbl);
        fd.append('tbl_id', focus.tbl_id);
        $http.post('/resources', fd, {
          withCredentials: true,
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        }).success(function(data, status, headers, config) {
          $scope.resources.unshift(data);
        });
      }
    };

    $scope.remove = function(rs) {
      if (rs) {
        var resource = new Resources(rs);
        resource.$remove();
        for (var i in $scope.resources) {
          if ($scope.resources[i]._id === resource._id) {
            $scope.resources.splice(i, 1);
          }
        }
      }
    };

    $scope.find = function() {
      if ($window.focus.tbl_id !== '' && $window.focus.tbl !== '') {
        $scope.resources = Resources.query($window.focus);
      } else {
        $scope.resources = [];
      }
    };

    $scope.findOne = function() {
      $scope.resource = Resources.get({
        resourceId: $stateParams.resourceId
      });
    };

  }
]);
