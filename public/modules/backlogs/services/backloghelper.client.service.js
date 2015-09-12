'use strict';

angular.module('backlogs').factory('BacklogHelper', ['$resource', '$http', '$timeout',
  function($resource, $http, $timeout) {
    var getListBacklogOfSprint = function(projectId, sprintId, callback) {
      $http.get('/projects/' + projectId + '/backlogs/backlog_with_sprint/' + sprintId)
        .success(function(data, status, headers, config) {
          return callback(data);
        })
        .error(function(data, status, headers, config) {
          return callback([]);
        });
    };

    var getFreeBacklogOfProject = function(projectId, callback) {
      $http.get('/projects/' + projectId + '/backlogs/backlog_without_sprint/')
        .success(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(data);
          }
        })
        .error(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback([]);
          }
        });
    };

    var moveBacklogToSprint = function(projectId, sprintId, backlogId, params, callback) {
      $http.post('/projects/' + projectId + '/backlogs/' + backlogId + '/add_to_sprint/' + sprintId, params)
        .success(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(false, data);
          }
        })
        .error(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(true, []);
          }
        });
    };

    var removeBacklogFromSprint = function(projectId, backlogId, params, callback) {
      $http.post('/projects/' + projectId + '/backlogs/' + backlogId + '/remove_from_sprint/', params)
        .success(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(false, data);
          }
        })
        .error(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(true, []);
          }
        });
    };

    var orderBacklog = function(projectId, backlog_ids, callback) {
      $http.post('/projects/' + projectId + '/backlogs/order_backlog', {
          backlog_ids: backlog_ids
        })
        .success(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(false, data);
          }
        }).error(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(true, []);
          }
        });
    };

    var acceptBacklog = function(projectId, backlogId, accept, callback) {
      $http.post('/projects/' + projectId + '/backlogs/' + backlogId + '/accept', {
          accept: accept
        })
        .success(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(false, data);
          }
        }).error(function(data, status, headers, config) {
          if (angular.isFunction(callback)) {
            return callback(true, []);
          }
        });
    };

    return {
      getListBacklogOfSprint: function(projectId, sprintId, callback) {
        return getListBacklogOfSprint(projectId, sprintId, callback);
      },
      moveBacklogToSprint: function(projectId, sprintId, backlogId, backlog_ids, callback) {
        return moveBacklogToSprint(projectId, sprintId, backlogId, backlog_ids, callback);
      },
      removeBacklogFromSprint: function(projectId, backlogId, backlog_ids, callback) {
        return removeBacklogFromSprint(projectId, backlogId, backlog_ids, callback);
      },
      orderBacklog: function(projectId, backlog_ids, callback) {
        return orderBacklog(projectId, backlog_ids, callback);
      },
      getFreeBacklogOfProject: function(projectId, callback) {
        return getFreeBacklogOfProject(projectId, callback);
      },
      acceptBacklog: function(projectId, backlogId, accept, callback) {
        return acceptBacklog(projectId, backlogId, accept, callback);
      }
    };
  }
]);
