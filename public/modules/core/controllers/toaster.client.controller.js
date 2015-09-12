'use strict';

angular.module('core').controller('ToasterController', ['$scope', 'toaster',
	function($scope, toaster) {
		var _toaster = $scope.$on('rootScope:toaster', function(event, data){
            toaster.pop(data);
        });
	}
]);