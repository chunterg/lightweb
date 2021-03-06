var fs = require('fs');
var path = require('path')
exports.walk = function(cfg) {
	// Middleware
	return function(req, res, next) {
		var str = scan(cfg.root + req.originalUrl);
		console.log(str)
			res.render('fileList', {
				_root: req.get('host'),
				title: 'File list',
				siteurl: cfg.siteUrl,
				h1: cfg.root + req.originalUrl,
				body: str
			});
	}

	function scan(dir) {
		var files = [],
			folders = [],
			unFolders = [];
		try {
			files = fs.readdirSync(dir);
		} catch (e) {
			files = []
		}
		if (files.length > 0) {

			for (var i = 0; i < files.length; i++) {
				stats = fs.lstatSync(dir + files[i]);
				if (stats.isDirectory()) {
					folders.push({
						name: files[i],
						src: files[i],
						isDir: true
					});
				} else {
					unFolders.push({
						name: files[i],
						src: files[i],
						isDir: false
					});
				}
			}
			files = folders.concat(unFolders);
		}
		return files
	}
}