var fs = require('fs');
var path = require('path');
var iconv = require('../node_modules/iconv-lite');
SiteController = function (app, mongoose, cfg) {

    //include
    app.get('*.html|*.htm', function(req, res, next) {
        var content = fs.readFileSync(cfg.root + req.path);
        content = iconv.decode(content, cfg.encode);
        res.charset = cfg.encode;
        res.end(content)
    });
    // app.get(cfg.siteDirectory+'404/?', function(req, res, next) {
    //     next();
    // });

    // app.get(cfg.siteDirectory+'403/?', function(req, res, next){
    //     var err = new Error('not allowed!');
    //     err.status = 403;
    //     next(err);
    // });
    // app.get(cfg.siteDirectory+'500/?', function(req, res, next) {
    //     next(new Error('Technical error occured'));
    // });
    
    app.use(function(req, res, next){
      res.render('404', {
        title: "Page not found",
        siteUrl: cfg.siteUrl,
      });
    });
}
module.exports = SiteController;