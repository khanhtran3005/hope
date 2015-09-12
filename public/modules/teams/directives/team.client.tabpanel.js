'use strict';

angular.module('teams').directive('teamTabPanel', function () {
    return {
        template: 'Name: {{customer.name}}<br /> Street: {{customer.street}}'
    };
});