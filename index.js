var http = require('http');
var querystring = require('querystring');

module.exports = function(bot, module) {

	module.addCommand(/^(?:gitio|shorten) (https?:\/\/(?:gist\.)?github\.com\/[^ ]+)(?: (?:using|with) ([^\\\/ ]+))?$/i, function(request, url, code) {
		var data = { url: url };
		if (code) {
			data.code = code;
		}
		var stringData = querystring.stringify(data);
		var options = {
			host: 'git.io',
			port: 80,
			path: '/',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': stringData.length
			}
		};
		var req = http.request(options, function(res) {
			if (res.statusCode === 201) {
				request.reply = res.headers.location;
				bot.reply(request);
			}
			else if (res.statusCode === 422) {
				var body = '';
				res.on('data', function(chunk) {
					body += chunk;
				});
				res.on('end', function() {
					request.reply = body;
				});
				bot.reply(request);
			}
		});
		req.on('error', function(error) {
			request.reply = 'Unable to create a short url.';
			bot.reply(request);
		});

		req.write(stringData + "\n");
		req.end();
	});

};
