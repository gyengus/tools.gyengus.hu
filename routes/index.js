var express = require('express');
var router = express.Router();

var fs = require('fs');
var dns = require('dns');
var crypto = require('crypto');

var news = require('../lib/news');
console.log(news);

// Index
router.get('/', function(req, res, next) {
	news.read(function(news) {
		//console.log('news: ' + news);
		var ip = req.connection.remoteAddress;
		//console.log('Client IP: ' + ip);
		res.render('index', { title: 'tools.gyengus.hu', ip: ip, app_version: req.APP_VERSION, news: news });
	});
});

// Jelszó generátor
router.get('/api/genpassword', function(req, res, next) {
	// FankaDeli - Végtelen (részlet)
    var dummyString = 'AvoltelmultAL.esz_MajdJonaKezemRemeg-SzemembenKonnyMertJonaViharaTengerenDeBe.leugrokDeMondomHogyNem_MeremEsNegondoldHogyTobbetNemLeh.etHiabaLoknekElenUgyisFelkelekNembiromtov@bbugranom-kellKialtokd.eavegtelennemFelel'.split('').sort(function() { return 0.5 - Math.random(); } ).join('');
    var dummyNumber = '' + Math.random();
    var x = Math.floor((Math.random() * 6) + 1); // Számok száma
    //console.log('X: ' + x);
    var tmp = 2 + x;
    if (tmp > (dummyNumber.length - 1)) tmp = dummyNumber.length - 1;
    var passwd = dummyNumber.substring(2, tmp) + dummyString.substring(0, 18);
    passwd = passwd.split('').sort(function() { return 0.5 - Math.random(); } ).join('');
    res.send(passwd);
});

// Hostname lekérdezése IP alapján
router.get('/api/gethostname/:ip', function(req, res, next) {
	// Reverse resolves an ip address to an array of hostnames.
	dns.reverse(req.params.ip, function(err, hostname) {
		if (err) {
			console.log(err);
			hostname = [req.params.ip];
		}
		//console.log(hostname);
		res.send(hostname);
    });
});

// IP lekérdezése hostname alapján
router.get('/api/getip/:hostname', function(req, res, next) {
    var dns = require('dns');
    dns.resolve(req.params.hostname, function(err, ip) {
		if (err) console.log(err);
		//console.log(ip);
        res.send(ip);
    });
});

// Hash kódolás (MD5, SHA1)
router.get('/api/genhash/:hash/:str', function(req, res, next) {
    var hash = crypto.createHash(req.params.hash).update(req.params.str).digest('hex');
    //console.log(req.params.hash + '(' + req.params.str + ') = ' + hash);
    res.send(hash);
});

module.exports = router;
