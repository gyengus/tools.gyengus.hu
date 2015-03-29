var fs = require('fs');
var parseString = require('xml2js').parseString;

var News = {};

News.read = function(callback) {
	//console.log('read news...');
	fs.readFile(__dirname + '/cache/news.json', function(err, data) {
		if (err) {
			// feed letöltése
			var http_client = require('http');
			http_client.get('http://gyengus.hu/feed/', function(res) {
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					parseString(body, function (err, result) {
						var news_array = [];
						result.rss.channel[0].item.forEach(function(item) {
							var obj = {};
							obj.title = item.title[0];
							obj.link = item.link[0];
							obj.desc = item.description[0];
							news_array.push(obj);
						});
						fs.writeFile(__dirname + '/cache/news.json', JSON.stringify(news_array), function(err) {
							if (err) console.log(err);
							News.read(callback);
						});
					});
				});
			}).on('error', function(err) {
				console.log(err.message);
			});
		} else {
			fs.stat(__dirname + '/cache/news.json', function(err, stats) {
				if (err) console.log(err);
				var d = new Date(stats.mtime).getTime();
				var most = new Date().getTime();
				if ((most - d) >= 300000) {
					fs.unlink(__dirname + '/cache/news.json', function() {
						News.read(callback);
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
					callback(news_html);
				}
			});
		}
	});
};

module.exports = News;
