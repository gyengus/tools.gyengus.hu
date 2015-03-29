var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');

var routes = require('./routes/index');

var app = express();

app.LOGDIR = 'logs';

// Read version from package.json
app.APP_VERSION = "N/A";
fs.readFile(__dirname + '/package.json', 'utf8', function (err, data) {
	if (err) console.log(err);
	var package_data = JSON.parse(data);
	app.APP_VERSION = package_data.version;
	console.log('Application version: ' + app.APP_VERSION);
});

console.log('Dirname: ' + __dirname);

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
	/*var most = new Date(); // Ezt a dátumformázást be kellene rakni a Date.prototype-ba
	//console.log('Time:', most.getFullYear() + '-' + (most.getMonth() + 1) + '-' + most.getDate() + ' ' + most.getHours() + ':' + most.getMinutes() + ':' + most.getSeconds() + '.' + most.getMilliseconds());
	fs.appendFile(app.LOGDIR + '/access.log', req.originalUrl + '\n' + JSON.stringify(req.headers) + '\n' + JSON.stringify(req.params) + '\n', function(err) {
		if (err) console.log('Hiba az access.log írása közben: ' + err);
	});*/
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
		res.status(err.status || 500);
		res.render('error', {
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
	res.render('error', {
		message: err.message,
		error: {}
	});
});

// signal kezelés
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	].forEach(function(element, index, array) {
		process.on(element, function() {
			console.log('%s: Node server stopped by %s signal.', Date(Date.now()), element);
			process.exit();
		});
	});

module.exports = app;
