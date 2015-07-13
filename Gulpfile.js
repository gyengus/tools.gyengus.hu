var argv = global.argv = require('minimist')(process.argv.slice(2));
var gulp = global.gulp = require('gulp'),
	plugins = global.plugins = require("gulp-load-plugins")( { scope: ['devDependencies'] } );

var runSequence = global.runSequence = require('run-sequence');
var fs = require('fs');
var rimraf = require('rimraf');

gulp.task('clean-web', function(callback) {
	if( fs.existsSync('./public/') )
		rimraf('./public/', callback );
	else callback();
});

var web = require('./gulp/web' );
gulp.task('build-web', function(callback) {
	runSequence(
		'clean-web', web.buildTasks, callback
	);
} );


gulp.task('build', function(callback) {
	runSequence(
		web.buildTasks, callback
	);
} );

gulp.task('watch', function(callback) {
	global.developmentMode = true;
	runSequence(
		'watch-web', callback
	);
} );

// gulp deploy --dest=/path/to/destination
gulp.task('deploy', function(callback) {
	var destination = argv.dest;
	//console.log('deploy, destination: ' + argv.dest);
	runSequence(
		'restartapp', callback
	);
});

gulp.task('check', function(callback) {
	//var CONFIG = require('./config.json'); // TODO: csere configloaderre
	var CONFIG = require('./lib/configLoader').load();
	// http.get, ha a válasz státusza 200, akkor ok, különben hibaüzenet
	var http = require('http');
	http.get('http://localhost:' + CONFIG.port, function(res) {
		if (res.statusCode === 200) return callback();
		return callback(new Error('on get http://localhost:' + CONFIG.port + ' received status code: ' + res.statusCode));
	}).on('error', function(err) {
		return callback(new Error('on get http://localhost:' + CONFIG.port + ' ' + err.message));
	});
});

gulp.task('default', ['build']);
