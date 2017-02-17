var express = require('express');
var router = express.Router();

var CONFIG = require('../lib/configLoader').load();
var fs = require('fs');
var dns = require('dns');
var crypto = require('crypto');
var Logger = require('../lib/logger');
var sys_logger = new Logger({logdir: __dirname + '/../' + CONFIG.logdir + '/'});
var newsLib = require('../lib/news');
var news = new newsLib({sys_logger: sys_logger});

// Index
router.get('/', function getIndexPage(req, res, next) {
	news.read(function(news) {
		var ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
		res.render('index', { title: req.APP_NAME,
							  site_desc: req.CONFIG.site_desc,
							  site_keywords: req.CONFIG.site_keywords,
							  site_url: req.CONFIG.site_url,
							  site_image: req.CONFIG.site_image,
							  ga_id: req.CONFIG.ga_id,
							  ip: ip, app_version: req.APP_VERSION,
							  news: news
							});
	});
});

// Password generator
router.get('/api/genpassword', function getGenPassword(req, res, next) {
	// FankaDeli - Végtelen (részlet)
	var dummyString = 'AvoltelmultAL.esz_M@jdJonaKezemRemeg-SzemembenKonnyMertJonaViharaTengerenDeBe.leugrokDeMondomHogyNem_MeremEsNegondoldHogyTobbetNemLeh.etHiabaLoknekElenUgyisFelkelekNembiromtov@bbugranom-kellKialtokd.eavegtelennemFelel'.split('').sort(function() { return 0.5 - Math.random(); }).join('');
	var dummyNumber = '' + Math.random();
	var numberOfNumbers = Math.floor((Math.random() * 6) + 1);
	var tmp = 2 + numberOfNumbers;
	if (tmp > (dummyNumber.length - 1)) tmp = dummyNumber.length - 1;
	var passwd = dummyNumber.substring(2, tmp) + dummyString.substring(0, 18);
	passwd = passwd.split('').sort(function() { return 0.5 - Math.random(); }).join('');
	res.send(passwd);
});

// Hostname lookup by IP
router.get('/api/gethostname/:ip', function getHostname(req, res, next) {
	// Reverse resolves an ip address to an array of hostnames.
	dns.reverse(req.params.ip, function(err, hostname) {
		if (err) {
			hostname = [req.params.ip];
			req.sys_logger.write(err, 'error');
		}
		res.send(hostname);
	});
});

// IP lookup by hostname
router.get('/api/getip/:hostname', function getIP(req, res, next) {
	var dns = require('dns');
	dns.resolve(req.params.hostname, function(err, ip) {
		if (err) {
			req.sys_logger.write(err, 'error');
			res.send(['Nem sikerült lekérdezni a szerver IP címét.']);
		} else {
			res.send(ip);
		}
	});
});

// Calculate hash (MD5, SHA1, etc.)
router.get('/api/genhash/:hash/:str', function getCalculateHash(req, res, next) {
	var hash = crypto.createHash(req.params.hash).update(decodeURIComponent(req.params.str)).digest('hex');
	res.send(hash);
});

router.get('/api/base64/:mode/:str', function base64calc(req, res, next) {
	var result;
	if (req.params.mode == 'encode') {
		result = new Buffer(req.params.str).toString('base64');
	} else {
		result = new Buffer(req.params.str, 'base64').toString('utf8');
	}
	res.send(result);
});

module.exports = router;
