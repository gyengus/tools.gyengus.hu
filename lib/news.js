var fs = require('fs');
var parseString = require('xml2js').parseString;
var http_client = require('http');

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
						callback(self.createNewsHTML(JSON.parse(fs.readFileSync(__dirname + '/../cache/news.json', 'utf8'))));
					}
				}
			});
		}
	});
};

News.prototype.downloadXML = function(callback) {
	var self = this;
	http_client.get('http://gyengus.hu/feed/', function(res) {
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
	parseString(xmlBody, function (err, result) {
		var news_array = self.createNewsArray(result);
		fs.writeFile(__dirname + '/../cache/news.json', JSON.stringify(news_array), function(err) {
			if (err) {
				self.sys_logger.write(err, 'error');
				callback('Nem sikerült elmenteni a cikkeket.');
			} else {
				self.read(callback);
			}
		});
	});
};

News.prototype.createNewsArray = function(data) {
	var news_array = [];
	data.rss.channel[0].item.forEach(function(item) {
		var oneNews = {};
		oneNews.title = item.title[0];
		oneNews.link = item.link[0];
		oneNews.desc = item.description[0];
		news_array.push(oneNews);
	});
	return news_array;
};

News.prototype.createNewsHTML = function(news_data) {
	var news_html = '';
	var numberOfNews = news_data.length;
	if (numberOfNews > 10) numberOfNews = 10;
	for (var i = 0; i < numberOfNews; i++) {
		news_html += '<div class="news">'
				  + '<a href="#" class="expandbtn"><span class="icon icon-circle-down"></span></a>'
				  + '<a href="' + news_data[i].link + '">' + news_data[i].title + '</a>'
				  + '<div class="news_desc">' + news_data[i].desc + '</div></div>';
	}
	return news_html;
};

module.exports = News;
