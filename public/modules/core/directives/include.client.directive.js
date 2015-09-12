'use strict';

angular.module('core').directive('include', ['$http', '$templateCache', '$compile',
    function($http, $templateCache, $compile) {
        return {
            restrict: 'A',
            scope: {
                callback: '&callback'
            },
            link: function(scope, element, attributes) {
                var templateUrl = scope.$eval(attributes.include);
                $http.get(templateUrl, {
                    cache: $templateCache
                }).success(
                    function(tplContent) {
                        element.replaceWith($compile(tplContent)(scope));
                        scope.callback();
                    }
                );
            }
        };
    }
]);
