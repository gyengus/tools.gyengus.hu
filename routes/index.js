var express = require('express');
var router = express.Router();

var fs = require('fs');
var dns = require('dns');
var crypto = require('crypto');
var parseString = require('xml2js').parseString;

var readnews = function(callback) {
	//console.log('read news...');
	fs.readFile('cache/news.json', function(err, data) {
		if (err) {
			// feed letöltése
			var http_client = require('http');
			http_client.get('http://gyengus.hu/feed/', function(res) {
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					/*fs.writeFile('cache/news.xml', body, function(err) {
						if (err) console.log(err);
					});*/
					parseString(body, function (err, result) {
						var news = [];
						//fs.writeFile('cache/news.json', JSON.stringify(result));
						//console.log(result.rss.channel[0].item[0].title[0] + ' ' + result.rss.channel[0].item[0].link[0]);
						result.rss.channel[0].item.forEach(function(item) {
							//console.log(item.title[0] + ' ' + item.description[0]);
							var obj = {};
							obj.title = item.title[0];
							obj.link = item.link[0];
							obj.desc = item.description[0];
							news.push(obj);
						});
						fs.writeFile('cache/news.json', JSON.stringify(news), function(err) {
							if (err) console.log(err);
							readnews(callback);
						});
					});
				});
			}).on('error', function(err) {
				console.log(err.message);
			});
		} else {
			fs.stat('cache/news.json', function(err, stats) {
				if (err) console.log(err);
				var d = new Date(stats.mtime).getTime();
				var most = new Date().getTime();
				if ((most - d) >= 300000) {
					fs.unlink('cache/news.json', function() {
						readnews(callback);
					});
				} else {
					var news_data = JSON.parse(data);
					var news_html = '';
					var x = news_data.length;
					if (x > 10) x = 10;
					for (var i = 0; i < x; i++) {
						news_html += '<div class="news"><a href="' + news_data[i].link + '">'
								  + news_data[i].title + '</a><a href="#" class="expandbtn"><span class="icon icon-circle-down"></span></a>'
								  + '<div class="news_desc">' + news_data[i].desc + '</div></div>';
					}
					//console.log('news_html: ' + news_html);
					callback(news_html);
				}
			});
		}
	});
};


// Index
router.get('/', function(req, res, next) {
	readnews(function(news) {
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
