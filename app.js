var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var Logger = require('./lib/logger');
var sys_logger = new Logger({logdir: __dirname + '/logs/'});

var routes = require('./routes/index');

// Dátum formázott kiírása: yyyy-mm-dd H:i:s
Date.prototype.getFormattedDate = function() {
	var time = this;
	var month = ((time.getMonth() + 1) > 9 ? '' : '0') + (time.getMonth() + 1);
	var day = (time.getDate() > 9 ? '' : '0') + time.getDate();
	var hour = (time.getHours() > 9 ? '' : '0') + time.getHours();
	var minute = (time.getMinutes() > 9 ? '' : '0') + time.getMinutes();
	var second = (time.getSeconds() > 9 ? '' : '0') + time.getSeconds();
	return time.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
};


var app = express();

app.APP_NAME = 'tools.gyengus.hu';
app.LOGDIR = 'logs';
app.sys_logger = sys_logger;

// Read version from package.json
app.APP_VERSION = "N/A";
fs.readFile(__dirname + '/package.json', 'utf8', function (err, data) {
	if (err) console.log(err);
	var package_data = JSON.parse(data);
	app.APP_VERSION = package_data.version;
	sys_logger.write('Application started, version: ' + app.APP_VERSION, 'system');
});

//console.log('Dirname: ' + __dirname);
//console.log('Dátum: ' + new Date().getFormattedDate());

// view engine setup
app.set('views', path.join(__dirname, 'web/views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.enable('trust proxy');
var accesslogStream = fs.createWriteStream(__dirname + '/' + app.LOGDIR + '/access.log', {flags: 'a'});
app.use(logger('combined', {stream: accesslogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(__dirname + '/files', express.static('downloads'));

// a middleware with no mount path, gets executed for every request to the router
app.use(function (req, res, next) {
	req.APP_VERSION = app.APP_VERSION;
	req.APP_NAME = app.APP_NAME;
	req.sys_logger = sys_logger;
	next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
	app.use(function(err, req, res, next) {
		var logerror = err.message + '\nURL: ' + req.originalUrl + '\nHeaders: ' + JSON.stringify(req.headers) + '\nError: ' + JSON.stringify(err) + '\nStack: ' + err.stack;
		req.sys_logger.write(logerror, 'error');
		res.status(err.status || 500);
		res.render('error', {
			title: req.APP_NAME,
			app_version: req.APP_VERSION,
			message: err.message,
			error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	// mentsük fájlba
	var logerror = err.message + '\nURL: ' + req.originalUrl + '\nHeaders: ' + JSON.stringify(req.headers) + '\nError: ' + JSON.stringify(err) + '\nStack: ' + err.stack;
	req.sys_logger.write(logerror, 'error');
	res.render('error', {
		title: req.APP_NAME,
		app_version: req.APP_VERSION,
		message: err.message,
		error: {}
	});
});

// signal kezelés
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	].forEach(function(element, index, array) {
		process.on(element, function() {
			//console.log('%s: Node server stopped by %s signal.', new Date().getFormattedDate(), element);
			app.sys_logger.write('Application stopped by ' + element + ' signal', 'system', function() {
				process.exit();
			});
		});
	});

module.exports = app;
