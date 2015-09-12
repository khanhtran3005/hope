'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Audit = mongoose.model('Audit'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, audit;

/**
 * Audit routes tests
 */
describe('Audit CRUD tests', function() {
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

		// Save a user to the test db and create new Audit
		user.save(function() {
			audit = {
				name: 'Audit Name'
			};

			done();
		});
	});

	it('should be able to save Audit instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Audit
				agent.post('/audits')
					.send(audit)
					.expect(200)
					.end(function(auditSaveErr, auditSaveRes) {
						// Handle Audit save error
						if (auditSaveErr) done(auditSaveErr);

						// Get a list of Audits
						agent.get('/audits')
							.end(function(auditsGetErr, auditsGetRes) {
								// Handle Audit save error
								if (auditsGetErr) done(auditsGetErr);

								// Get Audits list
								var audits = auditsGetRes.body;

								// Set assertions
								(audits[0].user._id).should.equal(userId);
								(audits[0].name).should.match('Audit Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Audit instance if not logged in', function(done) {
		agent.post('/audits')
			.send(audit)
			.expect(401)
			.end(function(auditSaveErr, auditSaveRes) {
				// Call the assertion callback
				done(auditSaveErr);
			});
	});

	it('should not be able to save Audit instance if no name is provided', function(done) {
		// Invalidate name field
		audit.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Audit
				agent.post('/audits')
					.send(audit)
					.expect(400)
					.end(function(auditSaveErr, auditSaveRes) {
						// Set message assertion
						(auditSaveRes.body.message).should.match('Please fill Audit name');
						
						// Handle Audit save error
						done(auditSaveErr);
					});
			});
	});

	it('should be able to update Audit instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Audit
				agent.post('/audits')
					.send(audit)
					.expect(200)
					.end(function(auditSaveErr, auditSaveRes) {
						// Handle Audit save error
						if (auditSaveErr) done(auditSaveErr);

						// Update Audit name
						audit.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Audit
						agent.put('/audits/' + auditSaveRes.body._id)
							.send(audit)
							.expect(200)
							.end(function(auditUpdateErr, auditUpdateRes) {
								// Handle Audit update error
								if (auditUpdateErr) done(auditUpdateErr);

								// Set assertions
								(auditUpdateRes.body._id).should.equal(auditSaveRes.body._id);
								(auditUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Audits if not signed in', function(done) {
		// Create new Audit model instance
		var auditObj = new Audit(audit);

		// Save the Audit
		auditObj.save(function() {
			// Request Audits
			request(app).get('/audits')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Audit if not signed in', function(done) {
		// Create new Audit model instance
		var auditObj = new Audit(audit);

		// Save the Audit
		auditObj.save(function() {
			request(app).get('/audits/' + auditObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', audit.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Audit instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Audit
				agent.post('/audits')
					.send(audit)
					.expect(200)
					.end(function(auditSaveErr, auditSaveRes) {
						// Handle Audit save error
						if (auditSaveErr) done(auditSaveErr);

						// Delete existing Audit
						agent.delete('/audits/' + auditSaveRes.body._id)
							.send(audit)
							.expect(200)
							.end(function(auditDeleteErr, auditDeleteRes) {
								// Handle Audit error error
								if (auditDeleteErr) done(auditDeleteErr);

								// Set assertions
								(auditDeleteRes.body._id).should.equal(auditSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Audit instance if not signed in', function(done) {
		// Set Audit user 
		audit.user = user;

		// Create new Audit model instance
		var auditObj = new Audit(audit);

		// Save the Audit
		auditObj.save(function() {
			// Try deleting Audit
			request(app).delete('/audits/' + auditObj._id)
			.expect(401)
			.end(function(auditDeleteErr, auditDeleteRes) {
				// Set message assertion
				(auditDeleteRes.body.message).should.match('User is not logged in');

				// Handle Audit error error
				done(auditDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Audit.remove().exec();
		done();
	});
});