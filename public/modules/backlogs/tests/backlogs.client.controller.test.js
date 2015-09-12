'use strict';

(function() {
	// Backlogs Controller Spec
	describe('Backlogs Controller Tests', function() {
		// Initialize global variables
		var BacklogsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Backlogs controller.
			BacklogsController = $controller('BacklogsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Backlog object fetched from XHR', inject(function(Backlogs) {
			// Create sample Backlog using the Backlogs service
			var sampleBacklog = new Backlogs({
				name: 'New Backlog'
			});

			// Create a sample Backlogs array that includes the new Backlog
			var sampleBacklogs = [sampleBacklog];

			// Set GET response
			$httpBackend.expectGET('backlogs').respond(sampleBacklogs);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.backlogs).toEqualData(sampleBacklogs);
		}));

		it('$scope.findOne() should create an array with one Backlog object fetched from XHR using a backlogId URL parameter', inject(function(Backlogs) {
			// Define a sample Backlog object
			var sampleBacklog = new Backlogs({
				name: 'New Backlog'
			});

			// Set the URL parameter
			$stateParams.backlogId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/backlogs\/([0-9a-fA-F]{24})$/).respond(sampleBacklog);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.backlog).toEqualData(sampleBacklog);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Backlogs) {
			// Create a sample Backlog object
			var sampleBacklogPostData = new Backlogs({
				name: 'New Backlog'
			});

			// Create a sample Backlog response
			var sampleBacklogResponse = new Backlogs({
				_id: '525cf20451979dea2c000001',
				name: 'New Backlog'
			});

			// Fixture mock form input values
			scope.name = 'New Backlog';

			// Set POST response
			$httpBackend.expectPOST('backlogs', sampleBacklogPostData).respond(sampleBacklogResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Backlog was created
			expect($location.path()).toBe('/backlogs/' + sampleBacklogResponse._id);
		}));

		it('$scope.update() should update a valid Backlog', inject(function(Backlogs) {
			// Define a sample Backlog put data
			var sampleBacklogPutData = new Backlogs({
				_id: '525cf20451979dea2c000001',
				name: 'New Backlog'
			});

			// Mock Backlog in scope
			scope.backlog = sampleBacklogPutData;

			// Set PUT response
			$httpBackend.expectPUT(/backlogs\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/backlogs/' + sampleBacklogPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid backlogId and remove the Backlog from the scope', inject(function(Backlogs) {
			// Create new Backlog object
			var sampleBacklog = new Backlogs({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Backlogs array and include the Backlog
			scope.backlogs = [sampleBacklog];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/backlogs\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBacklog);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.backlogs.length).toBe(0);
		}));
	});
}());