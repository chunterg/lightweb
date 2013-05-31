var app = require('express')(),
  fs = require('fs'),
  path = require('path'),
  iconv = require('iconv-lite');

exports.run = function(cfg) {
  return function(req, res, next) {
    if (req.url.match(/\/ajax(\/|\?)/g)) {
      var ajaxCfg = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8').replace(/\/\*[\w\W]*?\*\//gm, '').replace(/\/\/.*/gi, ''));
      var action = req.url.split(/\/|\?/g);
      action = action[2];
      var config = ajaxCfg.RequestMap,res_data = '';
      for (var ac in config) {
        if (ac == action) {
          if (!config[ac].res_code || config[ac].res_code == 200) {
            res.status(200);
            //if get the correct param
            if (isMatchedArg(config[ac].req, req.query)) {
              res_data = req.query.callback ? req.query.callback + '(' + JSON.stringify(config[ac].res.success) + ')' : config[ac].res.success;
              res.send(res_data);
            } else {
              res_data = req.query.callback ? req.query.callback + '(' + JSON.stringify(config[ac].res.fail) + ')' : config[ac].res.fail
              res.send(res_data);
            }
          } else {
            res.status(config[ac].res_code);
            res.send(config[ac].res_code);
          }
          return;
        }
      }
      res.send(404);
      res.end();
    } else if(path.extname(req.originalUrl)==".js"){
      var ajaxCfg = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8').replace(/\/\*[\w\W]*?\*\//gm, '').replace(/\/\/.*/gi, ''));
      
      if(!ajaxCfg.rewrite.enable){
        next();
        return;
      }

      var fileContent = fs.readFileSync(cfg.root + req.originalUrl,'utf-8');
      for (var i = ajaxCfg.rewrite.map.length - 1; i >= 0; i--) {
        fileContent = fileContent.replace('http://'+ajaxCfg.rewrite.map[i],'http://localhost:'+cfg.port+'/ajax')
      };
      res.end(fileContent);
    } else{
      next()
    }
  }
}



// To determine the value of two object.

function isMatchedArg(data1, data2) {
  if (typeof data1 == 'object' && typeof data2 == 'object') {
    for (var d in data1) {
      if (data1.hasOwnProperty(d) && data2.hasOwnProperty(d)) {
        if (data1[d] != data2[d]) {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }
}