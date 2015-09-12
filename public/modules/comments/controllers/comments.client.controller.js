'use strict';

// Comments controller
angular.module('comments').controller('CommentsController', ['$scope', '$stateParams', '$location', '$window', 'Authentication', 'Comments', 'hopeUI',
  function($scope, $stateParams, $location, $window, Authentication, Comments, hopeUI) {
    $scope.authentication = Authentication;

    // Create new Comment
    $scope.create = function() {
      // Create new Comment object
      var cm = angular.extend({}, this.comment, $window.focus);
      var comment = new Comments(cm);
      // Redirect after save
      comment.$save(function(comment) {
        comment.user = window.user;
        $scope.comments.unshift(comment);
        $scope.comment = {};
      }, function(errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    $scope.loadComment = function(tbl, tbl_id) {
      console.log(tbl_id);
      $scope.comments = Comments.query({
        tbl: tbl,
        tbl_id: tbl_id
      });
    };

    $scope.addComment = function(tbl, $event) {
      console.log('addComment');
      console.log($scope.comments);
      var content = $event.currentTarget[0].value,
        sprintId = $event.currentTarget[1].value,
        tbl_id = sprintId;

      var comment = new Comments({
        tbl: tbl,
        tbl_id: tbl_id,
        content: content
      });
      comment.$save(function(res) {
        console.log(res, $scope.comments);
        $event.currentTarget[0].value = '';
        res.user = window.user;
        $scope.comments.unshift(res);
      }, function(err) {
        console.log(err);
      });
    };

    // Find a list of Comments
    $scope.find = function() {
      if ($window.focus.tbl_id !== '' && $window.focus.tbl !== '') {
        $scope.comments = Comments.query($window.focus, function() {
          hopeUI.initSlimscroll();
          initCommentInput();
        });
      } else {
        $scope.comments = [];
        hopeUI.initSlimscroll();
        initCommentInput();
      }
    };

    function initCommentInput() {
      $('.comment-input').keypress(function(e) {
        if (e.keyCode == 13 && e.shiftKey) {
          return true;
        }
        if (e.keyCode === 13) {
          e.preventDefault();
          $scope.create();
        }
      });
    }
  }
]);
