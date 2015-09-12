'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Meeting = mongoose.model('Meeting'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, meeting;

/**
 * Meeting routes tests
 */
describe('Meeting CRUD tests', function() {
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

		// Save a user to the test db and create new Meeting
		user.save(function() {
			meeting = {
				name: 'Meeting Name'
			};

			done();
		});
	});

	it('should be able to save Meeting instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meeting
				agent.post('/meetings')
					.send(meeting)
					.expect(200)
					.end(function(meetingSaveErr, meetingSaveRes) {
						// Handle Meeting save error
						if (meetingSaveErr) done(meetingSaveErr);

						// Get a list of Meetings
						agent.get('/meetings')
							.end(function(meetingsGetErr, meetingsGetRes) {
								// Handle Meeting save error
								if (meetingsGetErr) done(meetingsGetErr);

								// Get Meetings list
								var meetings = meetingsGetRes.body;

								// Set assertions
								(meetings[0].user._id).should.equal(userId);
								(meetings[0].name).should.match('Meeting Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Meeting instance if not logged in', function(done) {
		agent.post('/meetings')
			.send(meeting)
			.expect(401)
			.end(function(meetingSaveErr, meetingSaveRes) {
				// Call the assertion callback
				done(meetingSaveErr);
			});
	});

	it('should not be able to save Meeting instance if no name is provided', function(done) {
		// Invalidate name field
		meeting.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meeting
				agent.post('/meetings')
					.send(meeting)
					.expect(400)
					.end(function(meetingSaveErr, meetingSaveRes) {
						// Set message assertion
						(meetingSaveRes.body.message).should.match('Please fill Meeting name');
						
						// Handle Meeting save error
						done(meetingSaveErr);
					});
			});
	});

	it('should be able to update Meeting instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meeting
				agent.post('/meetings')
					.send(meeting)
					.expect(200)
					.end(function(meetingSaveErr, meetingSaveRes) {
						// Handle Meeting save error
						if (meetingSaveErr) done(meetingSaveErr);

						// Update Meeting name
						meeting.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Meeting
						agent.put('/meetings/' + meetingSaveRes.body._id)
							.send(meeting)
							.expect(200)
							.end(function(meetingUpdateErr, meetingUpdateRes) {
								// Handle Meeting update error
								if (meetingUpdateErr) done(meetingUpdateErr);

								// Set assertions
								(meetingUpdateRes.body._id).should.equal(meetingSaveRes.body._id);
								(meetingUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Meetings if not signed in', function(done) {
		// Create new Meeting model instance
		var meetingObj = new Meeting(meeting);

		// Save the Meeting
		meetingObj.save(function() {
			// Request Meetings
			request(app).get('/meetings')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Meeting if not signed in', function(done) {
		// Create new Meeting model instance
		var meetingObj = new Meeting(meeting);

		// Save the Meeting
		meetingObj.save(function() {
			request(app).get('/meetings/' + meetingObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', meeting.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Meeting instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Meeting
				agent.post('/meetings')
					.send(meeting)
					.expect(200)
					.end(function(meetingSaveErr, meetingSaveRes) {
						// Handle Meeting save error
						if (meetingSaveErr) done(meetingSaveErr);

						// Delete existing Meeting
						agent.delete('/meetings/' + meetingSaveRes.body._id)
							.send(meeting)
							.expect(200)
							.end(function(meetingDeleteErr, meetingDeleteRes) {
								// Handle Meeting error error
								if (meetingDeleteErr) done(meetingDeleteErr);

								// Set assertions
								(meetingDeleteRes.body._id).should.equal(meetingSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Meeting instance if not signed in', function(done) {
		// Set Meeting user 
		meeting.user = user;

		// Create new Meeting model instance
		var meetingObj = new Meeting(meeting);

		// Save the Meeting
		meetingObj.save(function() {
			// Try deleting Meeting
			request(app).delete('/meetings/' + meetingObj._id)
			.expect(401)
			.end(function(meetingDeleteErr, meetingDeleteRes) {
				// Set message assertion
				(meetingDeleteRes.body.message).should.match('User is not logged in');

				// Handle Meeting error error
				done(meetingDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Meeting.remove().exec();
		done();
	});
});