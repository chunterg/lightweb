var fs = require('fs');
var path = require('path');
var less = require('less');
var md = require('markdown').markdown;
var iconv = require('iconv-lite');
exports.run = function(cfg) {
	// Middleware
	return function(req, res, next) {
		try {
			var fileContent = fs.readFileSync(cfg.root + req.originalUrl, 'utf8');
			switch (path.extname(req.originalUrl)) {
				case '.less':
					less.render(fileContent, function(e, css) {
						res.set({
							'Content-Type': 'text/css',
						});
						res.send(css);
						res.end();
					});
					break;
				case '.md'||'.markdown':
					res.render('markdown', {
						title: 'md - Node static server',
						body: md.toHTML(fileContent)
					});
					res.end();
					break;
				default:
					next();
			}
		} catch (e) {
			//console.log(e);
			next();
		}

	}

}