'use strict';

angular.module('articles').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Articles',
  function($scope, $stateParams, $location, Authentication, Articles) {
    $scope.authentication = Authentication;

    // $scope.create = function() {
    //  var article = new Articles({
    //    title: this.title,
    //    content: this.content
    //  });
    //  article.$save(function(response) {
    //    $location.path('articles/' + response._id);
    //    $scope.title = '';
    //    $scope.content = '';
    //  }, function(errorResponse) {
    //    $scope.error = errorResponse.data.message;
    //  });
    // };

    // $scope.remove = function(article) {
    //  if (article) {
    //    article.$remove();

    //    for (var i in $scope.articles) {
    //      if ($scope.articles[i] === article) {
    //        $scope.articles.splice(i, 1);
    //      }
    //    }
    //  } else {
    //    $scope.article.$remove(function() {
    //      $location.path('articles');
    //    });
    //  }
    // };

    // $scope.update = function() {
    //  var article = $scope.article;

    //  article.$update(function() {
    //    $location.path('articles/' + article._id);
    //  }, function(errorResponse) {
    //    $scope.error = errorResponse.data.message;
    //  });
    // };

    // $scope.find = function() {
    //  $scope.articles = Articles.query();
    // };

    // $scope.findOne = function() {
    //  $scope.article = Articles.get({
    //    articleId: $stateParams.articleId
    //  });
    // };

    // $scope.models = {
    //   selected: null,
    //   templates: [{
    //     type: "item",
    //     id: 2
    //   }, {
    //     type: "container",
    //     id: 1,
    //     columns: [
    //       [],
    //       []
    //     ]
    //   }],
    //   dropzones: {
    //     "A": [{
    //       "type": "container",
    //       "id": 1,
    //       "columns": [
    //         [{
    //           "type": "item",
    //           "id": "1"
    //         }, {
    //           "type": "item",
    //           "id": "2"
    //         }],
    //         [{
    //           "type": "item",
    //           "id": "3"
    //         }]
    //       ]
    //     }, {
    //       "type": "item",
    //       "id": "4"
    //     }, {
    //       "type": "item",
    //       "id": "5"
    //     }, {
    //       "type": "item",
    //       "id": "6"
    //     }],
    //     "B": [{
    //       "type": "item",
    //       "id": 7
    //     }, {
    //       "type": "item",
    //       "id": "8"
    //     }, {
    //       "type": "container",
    //       "id": "2",
    //       "columns": [
    //         [{
    //           "type": "item",
    //           "id": "9"
    //         }, {
    //           "type": "item",
    //           "id": "10"
    //         }, {
    //           "type": "item",
    //           "id": "11"
    //         }],
    //         [{
    //           "type": "item",
    //           "id": "12"
    //         }, {
    //           "type": "container",
    //           "id": "3",
    //           "columns": [
    //             [{
    //               "type": "item",
    //               "id": "13"
    //             }],
    //             [{
    //               "type": "item",
    //               "id": "14"
    //             }]
    //           ]
    //         }, {
    //           "type": "item",
    //           "id": "15"
    //         }, {
    //           "type": "item",
    //           "id": "16"
    //         }]
    //       ]
    //     }, {
    //       "type": "item",
    //       "id": 16
    //     }]
    //   }
    // };

    // $scope.$watch('models.dropzones', function(model) {
    //   $scope.modelAsJson = angular.toJson(model, true);
    // }, true);

  }
]);
