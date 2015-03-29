var fs = require('fs');

var Logger = function(options) {
	this.logdir = options.logdir || __dirname + '/logs/';
};

Logger.prototype.write = function(msg, level, callback) {
	level = level || 'system';
	msg = '*** ' + new Date().getFormattedDate() + '\n ' + msg + '\n***\n';
	fs.appendFile(this.logdir + '/' + level + '.log', msg, function(err) {
		if (err) console.log('Hiba a(z) ' + this.logdir + level + '.log írása közben: ' + err);
		if (callback) callback();
	});
}; // write

module.exports = Logger;
