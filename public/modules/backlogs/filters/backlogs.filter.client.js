'use strict';

angular.module('backlogs').filter('selectBacklogs', function() {
  return function(backlogs, team) {
    if (!backlogs) return [];
    return backlogs.filter(function(backlog) {
      if (!!backlog.assignee && !!backlog.assignee) {
        if (!!team) {
          if (backlog.assignee._id.toString() === team._id.toString()) {
            return true;
          }
        }
      } else {
        if (!team) {
          return true;
        }
      }
      return false;
    });
  };
});
