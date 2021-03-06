var fs = require('fs');
var parseString = require('xml2js').parseString;
var http_client = require('https');

var News = function(options) {
	this.sys_logger = options.sys_logger;
};

News.prototype.read = function(callback) {
	var self = this;
	fs.readFile(__dirname + '/../cache/news.json', function(err, data) {
		if (err) {
			self.downloadXML(callback);
		} else {
			fs.stat(__dirname + '/../cache/news.json', function(err, stats) {
				if (err) {
					self.sys_logger.write(err, 'error');
					callback('Hiba a cikkek betöltésekor.');
				} else {
					var dateOfCache = new Date(stats.mtime).getTime();
					var now = new Date().getTime();
					var fiveMinutes = 300000;
					if ((now - dateOfCache) >= fiveMinutes) {
						fs.unlink(__dirname + '/../cache/news.json', function() {
							self.read(callback);
						});
					} else {
						var cachedFeed = fs.readFileSync(__dirname + '/../cache/news.json', 'utf8');
						if (cachedFeed) {
							callback(self.createNewsHTML(JSON.parse(cachedFeed)));
						} else {
							fs.unlink(__dirname + '/../cache/news.json', function() {
								self.read(callback);
							});
						}
					}
				}
			});
		}
	});
};

News.prototype.downloadXML = function(callback) {
	var self = this;
	var httpOptions = {
		hostname: 'gyengus.hu',
		port: 443,
		path: '/feed/',
		method: 'GET',
		headers: {
			'User-Agent': 'tools.gyengus.hu RSS reader'
		}
	};

	http_client.get(httpOptions, function(res) {
		var responseBody = '';
		res.on('data', function(chunk) {
			responseBody += chunk;
		});
		res.on('end', function() {
			self.processXML(responseBody, callback);
		});
	}).on('error', function(err) {
		self.sys_logger.write(err.message, 'error');
		callback('Nem sikerült letölteni a cikkeket.');
	});
};

News.prototype.processXML = function(xmlBody, callback) {
	var self = this;

	parseString(xmlBody, function(err, result) {
		if (err || (xmlBody == '') || !result) {
			if (!err) err = 'Nem sikerült letölteni a cikkeket.'
			self.sys_logger.write(err, 'error');
			callback('Nem sikerült letölteni a cikkeket.');
		} else {
			var news_array = self.createNewsArray(result, callback);
			fs.writeFile(__dirname + '/../cache/news.json', JSON.stringify(news_array), function(err) {
				if (err) {
					self.sys_logger.write(err, 'error');
					callback('Nem sikerült elmenteni a cikkeket.');
				} else {
					self.read(callback);
				}
			});
		}
	});
};

News.prototype.createNewsArray = function(data, callback) {
	var self = this;
	var news_array = [];

	if (data && data.rss) {
		data.rss.channel[0].item.forEach(function(item) {
			var oneNews = {};
			oneNews.title = item.title[0];
			oneNews.link = item.link[0];
			oneNews.desc = item.description[0];
			news_array.push(oneNews);
		});
	} else {
		self.sys_logger.write('Empty RSS', 'error');
		callback('Hiányzik az rss az XMLből!');
	}
	return news_array;
};

News.prototype.createNewsHTML = function(news_data) {
	var news_html = '';
	var numberOfNews = news_data.length;
	if (numberOfNews > 10) numberOfNews = 10;
	for (var i = 0; i < numberOfNews; i++) {
		news_html += '<div class="news">'
				  + '<div class="news_title">'
				  + '<span class="expandbtn icon icon-circle-down"></span>'
				  + news_data[i].title
				  + '</div>'
				  + '<div class="news_desc">' + news_data[i].desc + '</div></div>';
	}
	return news_html;
};

module.exports = News;
