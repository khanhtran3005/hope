'use strict';

// Init the application configuration module for AngularJS application
var ApplicationConfiguration = (function() {
	// Init module configuration options
	var applicationModuleName = 'HOPE';
	var applicationModuleVendorDependencies = ['ngDragDrop', 'ngSmartTimeago','ngResource', 
												'ngCookies',  'ngAnimate',  'ngTouch',  'ngSanitize',  
												'ui.router', 'ui.bootstrap', 'ui.utils', 'ui.select', 
												'ngBootstrap', 'ui.calendar', 'ui.bootstrap.datetimepicker',
												'btford.socket-io', 'wysiwyg.module', 'colorpicker.module',
                        'toaster', 'dndLists', 'angularFileUpload', 'nvd3', 'nvd3ChartDirectives'];

  // Add a new vertical module
  var registerModule = function(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);

    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  };

  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
