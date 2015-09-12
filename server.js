'use strict';
/**
 * Module dependencies.
 */
var init = require('./config/init')(),
  config = require('./config/config'),
  mongoose = require('mongoose');

// for https
/*
var http = require('http'),
  https = require('https'),
  fs = require('fs');
*/

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Bootstrap db connection
var db = mongoose.connect(config.db, function(err) {
  if (err) {
    console.error('\x1b[31m', 'Could not connect to MongoDB!');
    console.log(err);
  }
});

// Init the express application
var express = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

//for https
/* 
var options = {
  key: fs.readFileSync('ssl/nginx.key'),
  cert: fs.readFileSync('ssl/nginx.crt')
};
https.createServer(options, app).listen(3000);
*/

// Start the app by listening on <port>
var server = express.app.listen(config.port);

//signaling already register socket.io, so in the congif/socket just you create socket obj
require('./config/signaling')(server, express.sessionStore, express.cookieParser, function(socket, io) {
    require('./config/socket')(socket, io);
});

//CronJob
require('./config/cronjob')();

exports = module.exports = express;

// Logging initialization
console.log('MEAN.JS application started on port ' + config.port);
