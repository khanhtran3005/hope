'use strict';

angular.module('comments').factory('CommentHelper', ['Comments',
    function(Comments) {
        // Commentshelper service logic
        // ...

        // Public API
        return {
            someMethod: function() {
                return true;
            },
            loadComment: function(tbl, tbl_id, res, err) {
            	console.log(tbl, tbl_id);
                return Comments.query({
                    tbl: tbl,
                    tbl_id: tbl_id
                }, res, err);
            }
        };
    }
]);
