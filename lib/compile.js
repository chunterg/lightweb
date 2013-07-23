var fs = require('fs');
var path = require('path');
var less = require('../node_modules/less');
var md = require('../node_modules/markdown').markdown;
var iconv = require('../node_modules/iconv-lite');
exports.run = function(cfg) {
	// Middleware
	return function(req, res, next) {
		try {
			
			switch (path.extname(req.originalUrl)) {
				case '.less':
					var fileContent = fs.readFileSync(cfg.root + req.originalUrl,'utf8');
					less.render(fileContent, function(e, css) {
						res.set({
							'Content-Type': 'text/css',
						});
						res.send(css);
						res.end();
					});
					break;
				case '.md'||'.markdown':
					var fileContent = fs.readFileSync(cfg.root + req.originalUrl);

					var str = iconv.decode(fileContent, cfg.encode);
					res.render('markdown', {
						title: req.originalUrl,
                		siteUrl:cfg.siteUrl,
						body: md.toHTML(str)
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