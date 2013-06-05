var fs = require('fs');
var express = require('./node_modules/express');
var app = express();
var mongoose = require('./node_modules/mongoose');
mongoose.connect('mongodb://localhost/lightweb');
//load server config
var cfg = fs.readFileSync(__dirname + '/config.json', 'utf8');
cfg = cfg.replace(/\/\*[\w\W]*?\*\//gm, '').replace(/\/\/.*/gi, '')
cfg = JSON.parse(cfg);
app.configure(function() {
	app.set('views', __dirname + '/view');
	app.set('view engine', 'jade');
	app.set('view options', { pretty: true });
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	//load middleware plugins
	if(cfg.middlewares.length>0){
		for(var i =0;i<cfg.middlewares.length;i++){
			app.use(require(cfg.middlewares[i]).run(cfg))
		}
	}
	app.use(app.router);

	//set static file parse
	app.use(express.static(cfg.root,{
		maxAge:!cfg.cache?604800:0
	}));
});
app.configure('development', function(){
  app.use(express.errorHandler({
		dumpExceptions: true,
		showStack: true
	}));
});

// require('./models/snippetsModel')(mongoose);
// Register Controllers
['snippets','blog','site'].forEach(function (controller) {
    require('./controllers/' + controller + 'Controller')(app,mongoose,cfg);
});

// //router
// app.get('*.html|*.htm',function(req, res) {
// 	var fileContent = fs.readFileSync(cfg.root + req.originalUrl);
//     res.charset = cfg.encode;
//     res.end(fileContent);
// });


app.listen(cfg.port);
console.log('server start');
