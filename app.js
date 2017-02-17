// Read configuration from config.json
var CONFIG = require('./lib/configLoader').load();

if (CONFIG.pmx) {
	var pmx = require('pmx'); // must init pmx before requiring any http module (before requiring express, hapi or other)
	pmx.init({
		http: true,
		errors: true,
		custom_probes: true,
		network: true,
		ports: true
	});
}

// Date format: yyyy-mm-dd H:i:s
global.getFormattedDate = function() {
	var time = new Date();
	var month = ((time.getMonth() + 1) > 9 ? '' : '0') + (time.getMonth() + 1);
	var day = (time.getDate() > 9 ? '' : '0') + time.getDate();
	var hour = (time.getHours() > 9 ? '' : '0') + time.getHours();
	var minute = (time.getMinutes() > 9 ? '' : '0') + time.getMinutes();
	var second = (time.getSeconds() > 9 ? '' : '0') + time.getSeconds();
	return time.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
};

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var Logger = require('./lib/logger');
var routes = require('./routes/index');

var sys_logger = new Logger({logdir: __dirname + '/' + CONFIG.logdir + '/'});

var app = express();

app.sys_logger = sys_logger;
app.APP_NAME = CONFIG.name;
app.LOGDIR = CONFIG.logdir;

if (process.argv[2] === '--development') {
	app.DEVMODE = true;
} else {
	app.DEVMODE = false;
}

// Read version from package.json
app.APP_VERSION = require('./package.json').version;
sys_logger.write('Application started, version: ' + app.APP_VERSION, 'system');

// view engine setup
app.set('views', path.join(__dirname, 'web/views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.set('trust proxy', function(ip) {
	if (ip === '127.0.0.1') return true;
	return false;
});
var accesslogStream = fs.createWriteStream(__dirname + '/' + app.LOGDIR + '/access.log', {flags: 'a'});
app.use(logger('combined', {stream: accesslogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(__dirname + '/files', express.static('downloads'));

// a middleware with no mount path, gets executed for every request to the router
app.use(function(req, res, next) {
	req.APP_VERSION = app.APP_VERSION;
	req.APP_NAME = app.APP_NAME;
	req.CONFIG = CONFIG;
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

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	var logerror = err.message + '\nURL: ' + req.originalUrl + '\nHeaders: ' + JSON.stringify(req.headers) + '\nError: ' + JSON.stringify(err) + '\nStack: ' + err.stack;
	req.sys_logger.write(logerror, 'error');
	if (app.DEVMODE)
		console.log(logerror);
	res.render('error', {
		title: req.APP_NAME,
		app_version: req.APP_VERSION,
		message: err.message,
		error: (app.DEVMODE ? err : {})
	});
});

if (CONFIG.pmx) {
	app.use(pmx.expressErrorHandler());
}

// signal handler
['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
	'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
	].forEach(function(element, index, array) {
		process.on(element, function() {
			sys_logger.write('Application stopped by ' + element + ' signal', 'system', function() {
				if (app.DEVMODE) console.log('Application stopped by ' + element + ' signal');
				process.exit();
			});
		});
	});

// Listening IP address
var ip_address = CONFIG.address || process.env.OPENSHIFT_NODEJS_IP || process.env.NODE_IP || '0.0.0.0';

/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(CONFIG.port || process.env.PORT || '51635');
app.set('port', port);

module.exports = app;

/**
 * Listen on provided port, on all network interfaces.
 */
var server = app.listen(port, ip_address, function() {
	app.sys_logger.write('Listening: ' + server.address().address + ':' + server.address().port, 'system');
	if (app.DEVMODE) console.log('Listening: ' + server.address().address + ':' + server.address().port);
});
server.on('error', onError);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
  	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}
