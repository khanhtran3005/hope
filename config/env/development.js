'use strict';

module.exports = {
	db: 'mongodb://localhost/hope-dev', //remember to chang DB URI to production in production.js
	app: {
		title: 'HOPE - Development Environment'
	},
	facebook: {
		clientID: process.env.FACEBOOK_ID || '379287165580864',
		clientSecret: process.env.FACEBOOK_SECRET || 'b967e34aa4b4dc8a928e55495df7157b',
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	},
	twitter: {
		clientID: process.env.TWITTER_KEY || 'zK6d8cwKWe0YaHwg6U5tDzTR0',
		clientSecret: process.env.TWITTER_SECRET || 'A8049lXoFs3tkiwtHPRCsj5FxEHgsDpnLNmIMD2HoHfpzeAEFJ',
		callbackURL: 'http://localhost:3000/auth/twitter/callback'
	},
	google: {
		clientID: process.env.GOOGLE_ID || '216894232912-5tgvrq1itcm99eu3gc116clqma3i8vdv.apps.googleusercontent.com',
		clientSecret: process.env.GOOGLE_SECRET || 'dYkKiN7dg3B2PGggL10OsWFF',
		callbackURL: 'http://localhost:3000/auth/google/callback'
	},
	linkedin: {
		clientID: process.env.LINKEDIN_ID || 'APP_ID',
		clientSecret: process.env.LINKEDIN_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/linkedin/callback'
	},
	github: {
		clientID: process.env.GITHUB_ID || 'APP_ID',
		clientSecret: process.env.GITHUB_SECRET || 'APP_SECRET',
		callbackURL: 'http://localhost:3000/auth/github/callback'
	},
	mailer: {
		from: process.env.MAILER_FROM || 'HOPE Robot',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'beprojectsp@gmail.com',
				pass: process.env.MAILER_PASSWORD || '12345678toi'
			}
		}
	}
};