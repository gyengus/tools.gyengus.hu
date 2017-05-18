var gulp = global.gulp;

var fs = require('fs');
var _ = global._ = require('lodash');
var gutil = require("gulp-util");
var path = require( 'path' );
var jeet = global.jeet = require("jeet");
var nib = global.nib = require('nib');
var rupture = global.rupture = require('rupture');
var kouto = global.kouto = require('kouto-swiss');
var uglify = require('gulp-uglify');
var exec = require('child_process').exec;

gulp.task('web-lint', function() {
	return gulp.src( ['web/js/*.js', '!web/js/*.min.js'] )
		.pipe( global.plugins.jshint() )
		.pipe( global.plugins.jshint.reporter('default' ));
});

gulp.task( 'copy-static', [ 'web-lint' ], function( ) {
	return gulp.src( ['./web/**/*', '!web/views/*', '!web/views', '!web/css/*.styl'] )
		.pipe( gulp.dest('./public') );
});

var buildTasks = [ 'web-lint', 'copy-static' ];

var buildGulp = 'build', stylusGulp = 'stylus', jsGulp = 'js';

gulp.task(jsGulp, [ 'copy-static' ], function( callback ) {
    if (global.argv.development) {
        gulp.src('web/js/*.js')
            .pipe(gulp.dest('public/js'));
    } else {
        gulp.src(['web/js/*.js', '!web/js/*.min.js'])
            .pipe(uglify())
            .pipe(gulp.dest('public/js'));
    }
    callback();
});

gulp.task(stylusGulp, function ( cb ) {
	return gulp.src('./web/css/*.styl')
		.pipe( global.plugins.stylus( {
			errors: true,
			use: [ global.jeet(), global.nib(), global.rupture(), global.kouto() ],
			compress: !global.argv.development,
			"include css": true,
		} ).on('error', function(err){
			console.error(err);
		}) )
		.pipe( global.plugins.autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
		}) )
		.on('error', function(err){ console.error(err); })
		.pipe( global.plugins.minifyCss( { keepBreaks: global.argv.development } ) )
		.pipe( gulp.dest('./public/css') )
		.pipe( global.plugins.livereload() );
});

gulp.task( buildGulp, [ stylusGulp, jsGulp ], function( cb ) { cb(); });
buildTasks = buildTasks.concat( stylusGulp, jsGulp );


exports.buildTasks = buildTasks;

gulp.task('deploy-copy', buildTasks, function(callback) {
	// létre kell hozni a célkönyvtárat, ha nem létezik!
	if (!fs.existsSync(global.argv.dest)){
    	fs.mkdirSync(global.argv.dest);
	}
	// fájlok másolása rsync-el
	exec('rsync -qrtah --delete --exclude config.json --exclude \'logs/*.log\' ./ ' + global.argv.dest, function(error, stdout, stderr) {
		if (error) return callback(new Error(error));
		return callback();
	});
});

gulp.task('restartapp', ['deploy-copy'], function(callback) {
	process.chdir(global.argv.dest);
	exec('pm2 startOrRestart pm2.json', function(error, stdout, stderr) {
		if (error) {
			return callback(new Error(error));
		} else {
			console.log(stdout);
			exec('pm2 save', function(error, stdout, stderr) {
				if (error) return callback(new Error(error));
				return callback();
			});
		}
	});
});
