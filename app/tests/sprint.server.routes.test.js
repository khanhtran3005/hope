'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Sprint = mongoose.model('Sprint'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, sprint;

/**
 * Sprint routes tests
 */
describe('Sprint CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Sprint
		user.save(function() {
			sprint = {
				name: 'Sprint Name'
			};

			done();
		});
	});

	it('should be able to save Sprint instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sprint
				agent.post('/sprints')
					.send(sprint)
					.expect(200)
					.end(function(sprintSaveErr, sprintSaveRes) {
						// Handle Sprint save error
						if (sprintSaveErr) done(sprintSaveErr);

						// Get a list of Sprints
						agent.get('/sprints')
							.end(function(sprintsGetErr, sprintsGetRes) {
								// Handle Sprint save error
								if (sprintsGetErr) done(sprintsGetErr);

								// Get Sprints list
								var sprints = sprintsGetRes.body;

								// Set assertions
								(sprints[0].user._id).should.equal(userId);
								(sprints[0].name).should.match('Sprint Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Sprint instance if not logged in', function(done) {
		agent.post('/sprints')
			.send(sprint)
			.expect(401)
			.end(function(sprintSaveErr, sprintSaveRes) {
				// Call the assertion callback
				done(sprintSaveErr);
			});
	});

	it('should not be able to save Sprint instance if no name is provided', function(done) {
		// Invalidate name field
		sprint.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sprint
				agent.post('/sprints')
					.send(sprint)
					.expect(400)
					.end(function(sprintSaveErr, sprintSaveRes) {
						// Set message assertion
						(sprintSaveRes.body.message).should.match('Please fill Sprint name');
						
						// Handle Sprint save error
						done(sprintSaveErr);
					});
			});
	});

	it('should be able to update Sprint instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sprint
				agent.post('/sprints')
					.send(sprint)
					.expect(200)
					.end(function(sprintSaveErr, sprintSaveRes) {
						// Handle Sprint save error
						if (sprintSaveErr) done(sprintSaveErr);

						// Update Sprint name
						sprint.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Sprint
						agent.put('/sprints/' + sprintSaveRes.body._id)
							.send(sprint)
							.expect(200)
							.end(function(sprintUpdateErr, sprintUpdateRes) {
								// Handle Sprint update error
								if (sprintUpdateErr) done(sprintUpdateErr);

								// Set assertions
								(sprintUpdateRes.body._id).should.equal(sprintSaveRes.body._id);
								(sprintUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Sprints if not signed in', function(done) {
		// Create new Sprint model instance
		var sprintObj = new Sprint(sprint);

		// Save the Sprint
		sprintObj.save(function() {
			// Request Sprints
			request(app).get('/sprints')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Sprint if not signed in', function(done) {
		// Create new Sprint model instance
		var sprintObj = new Sprint(sprint);

		// Save the Sprint
		sprintObj.save(function() {
			request(app).get('/sprints/' + sprintObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', sprint.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Sprint instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Sprint
				agent.post('/sprints')
					.send(sprint)
					.expect(200)
					.end(function(sprintSaveErr, sprintSaveRes) {
						// Handle Sprint save error
						if (sprintSaveErr) done(sprintSaveErr);

						// Delete existing Sprint
						agent.delete('/sprints/' + sprintSaveRes.body._id)
							.send(sprint)
							.expect(200)
							.end(function(sprintDeleteErr, sprintDeleteRes) {
								// Handle Sprint error error
								if (sprintDeleteErr) done(sprintDeleteErr);

								// Set assertions
								(sprintDeleteRes.body._id).should.equal(sprintSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Sprint instance if not signed in', function(done) {
		// Set Sprint user 
		sprint.user = user;

		// Create new Sprint model instance
		var sprintObj = new Sprint(sprint);

		// Save the Sprint
		sprintObj.save(function() {
			// Try deleting Sprint
			request(app).delete('/sprints/' + sprintObj._id)
			.expect(401)
			.end(function(sprintDeleteErr, sprintDeleteRes) {
				// Set message assertion
				(sprintDeleteRes.body.message).should.match('User is not logged in');

				// Handle Sprint error error
				done(sprintDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Sprint.remove().exec();
		done();
	});
});