var fs = require('fs');
var parseString = require('xml2js').parseString;

var News = {};

News.read = function(sys_logger, callback) {
	fs.readFile(__dirname + '/../cache/news.json', function(err, data) {
		if (err) {
			downloadXML(sys_logger, callback);
		} else {
			fs.stat(__dirname + '/../cache/news.json', function(err, stats) {
				if (err) {
					sys_logger.write(err, 'error');
					callback('Hiba a cikkek betöltésekor.');
				} else {
					var dateOfCache = new Date(stats.mtime).getTime();
					var now = new Date().getTime();
					var fiveMinutes = 300000;
					if ((now - dateOfCache) >= fiveMinutes) {
						fs.unlink(__dirname + '/../cache/news.json', News.read(sys_logger, callback));
					} else {
						callback(createNewsHTML(require(__dirname + '/../cache/news.json')));
					}
				}
			});
		}
	});
};

function downloadXML(sys_logger, callback) {
	var http_client = require('http');
	http_client.get('http://gyengus.hu/feed/', function(res) {
		var body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			processXML(sys_logger, body, callback);
		});
	}).on('error', function(err) {
		sys_logger.write(err.message, 'error');
		callback('Nem sikerült letölteni a cikkeket.');
	});
}

function processXML(sys_logger, body, callback) {
	parseString(body, function (err, result) {
		var news_array = createNewsArray(result);
		fs.writeFile(__dirname + '/../cache/news.json', JSON.stringify(news_array), function(err) {
			if (err) {
				sys_logger.write(err, 'error');
				callback('Nem sikerült elmenteni a cikkeket.');
			} else {
				News.read(sys_logger, callback);
			}
		});
	});
}

function createNewsArray(data) {
	var news_array = [];
	data.rss.channel[0].item.forEach(function(item) {
		var obj = {};
		obj.title = item.title[0];
		obj.link = item.link[0];
		obj.desc = item.description[0];
		news_array.push(obj);
	});
	return news_array;
}

function createNewsHTML(news_data) {
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
}

module.exports = News;
