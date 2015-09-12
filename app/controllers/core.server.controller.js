'use strict';

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	if(req.isAuthenticated())
		res.render('index', {
			login: req.isAuthenticated(),
			user: req.user || null
		});
	else 
		res.render('signin');
};