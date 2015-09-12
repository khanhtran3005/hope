'use strict';

angular.module('sprints').factory('SprintHelper', ['$resource', '$http',
  function($resource, $http) {
    // SprintHelper service logic
    // ...

    // Public API
    return {
      // listSprints: function(projectId) {
      //   return $http.get('/sprints/list/' + projectId);
      // },
      icons: [{
        name: 'star',
        value: 'fa fa-star'
      }, {
        name: 'code',
        value: 'fa fa-code'
      }, {
        name: 'eraser',
        value: 'fa fa-eraser'
      }, {
        name: 'pie-chart',
        value: 'fa fa-pie-chart'
      }, {
        name: 'refresh',
        value: 'fa fa-refresh'
      }, {
        name: 'tag',
        value: 'fa fa-tag'
      }, {
        name: 'users',
        value: 'fa fa-users '
      }, {
        name: 'trophy',
        value: 'fa fa-trophy'
      }, {
        name: 'thumbs-up',
        value: 'fa fa-thumbs-up '
      }],
      getSelectedIcon: function(obj, value) {
        var current = {};
        for (var i in obj) {
          for (var j in obj[i]) {
            if (j === 'value') {
              if (obj[i][j] === value) {
                current = obj[i];
                break;
              }
            }
          }
        }
        return current;
      },
      burndown: function(projectId, sprintId) {
        if (!sprintId)
          return $http.get('/projects/' + projectId + '/sprints/burndown');
        else
          return $http.get('/projects/' + projectId + '/sprints/burndown?sprintId=' + sprintId);
      }
    };
  }
]);
