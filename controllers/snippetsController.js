var SnippetsModel = require('../models/snippetsModel');
var _ = require('underscore');
var snippetsController = function (app,mongoose,cfg) {
    //增加新片断
    app.get(cfg.siteDirectory+'snippet/add', function(req, res, next) {
        if(!req.session.user){
            res.redirect('/user/login');
        }
        res.render('snippets',{
            title:"Add new snippets",
            siteUrl:cfg.siteUrl,
            action:"add",
            set:cfg.settings.snippet
        });
    });

    //编辑片断
    app.get(cfg.siteDirectory+'snippet/:id/edit', function(req, res, next) {
        if(!req.session.user){
            res.redirect('/user/login');
        }
        SnippetsModel.Snippets.findOne({ _id: req.params.id}, function (err, snippet) {
            if(err) throw err

            res.render('snippets',{
                title:"Edit snippets",
                siteUrl:cfg.siteUrl,
                action:"edit",
                 _id:req.params.id,
                docType:snippet.doc.docType||'',
                docContent:snippet.doc.docContent||'',
                name:snippet.name,
                html:snippet.html,
                style:snippet.style,
                script:snippet.script,
                tags:snippet.tags,
                set:cfg.settings.snippet,
                viewType:snippet.viewType||''
            });
        });

    });

    //片断处理函数
    app.all(cfg.siteDirectory+'snippet/do', function(req, res, next) {
        if(!(req.body.action&&req.body.name)){
            res.end('Wrong argument');
            return;
        }
        var isAjax = req.body._ajax&&req.body._ajax=="true"?true:false;

        if(!req.session.user){
            if(isAjax){
                res.json({status:'fail',message:'need login first'});
                res.end();
            }else{
                res.redirect('/user/login');
                res.end();
            }
        }
        var tags = req.body.tag+'';
        var _d = new Date();
        var dataReq = {
                    typeName: req.body.typeName,
                    typeId:req.body.typeId,
                    name:req.body.name||'',
                    html:req.body.html||'',
                    style:req.body.style||'',
                    script:req.body.script||'',
                    doc:{
                        docType:req.body.docType||'md',
                        docContent:req.body.docContent||''
                    },
                    viewType:req.body.viewType||'',
                    tags:req.body.tag?req.body.tag.split(','):[]
                }
        
        if(req.body.action=='add'){
            dataReq.created = {
                        name:'chunterg',
                        date:_d.getTime()
                    }
            var snippetsModel = new SnippetsModel.Snippets(dataReq);

        }
        if(tags.length>0){
            var tagModel = SnippetsModel.Tags;
            tags = tags.split(',');
            tags.forEach(function (tag) {
               tagModel.findOne({name:tag},function(err,data){
                    if(err) throw err;
                    if(data){
                        data.count = data.count+1
                        data.save(function(err,data){
                             console.log('updata tag success')
                        });
                    }else{
                        var _tagModel = new tagModel({
                            name:tag,
                            count:1
                        })
                        _tagModel.save( function( err, data ){
                            if(err) throw err;
                            console.log('create tag success')
                        });
                    }
               })
            })
        }
        
        if(req.body.action=='add'){
            snippetsModel.save( function( err, data ){
                    if(err) throw err;
                    console.log('create snippet '+data.name+' success');

                    if(isAjax){
                        res.json(data)
                    }else{
                        res.redirect( cfg.siteDirectory+'snippet/' ); 
                    }                   
                  });
        }else{
            SnippetsModel.Snippets.findOneAndUpdate({_id:req.body._id},dataReq,function(err,data){
                    if(err) throw err;
                    console.log('edit snippet '+data.name+' success');
                    if(isAjax){
                        res.json(data)
                    }else{
                        res.redirect( cfg.siteDirectory+'snippet/getSnippet?_id='+req.body._id );
                    } 
                    
               })
        }   
    });

    app.get(cfg.siteDirectory+'snippet/getSnippet', function(req, res, next) {
       // console.log(req.query)
       // var query = {
       //  _id:req.query._id||'',
       //  name:req.query.name,
       //  tags:req.query.tags
       // };
       // console.log(query)
       var query = req.query,callback='';
       if(req.query.callback){
        callback=query.callback;
        delete query.callback;
       } 
       SnippetsModel.Snippets.find(query,function(err,snippet){
            //if(err) res.jsonp([])
            res.charset = 'utf-8';
            res.type('text/javascript');
            res_data = callback?callback + '(' + JSON.stringify(snippet) + ')' : snippet;
            res.send(res_data)
            res.end();

            // req.query.callback=callback;
            // res.jsonp(snippet)
       })
    });

    app.get(cfg.siteDirectory+'snippet/deleteSnippet', function(req, res, next) {

       var query = req.query,callback='';
       if(req.query.callback){
        callback=query.callback;
        delete query.callback;
       } 
       
       res.end();
       return;
       // if(query){
       //      SnippetsModel.Snippets.remove(query,function(err){
       //      if(err) res.jsonp([])
            
            
       //  })
       // }else{
       //      res.json({status:'fail',message:'need query argument'});
       //      res.end();
       // }
       
    });

    app.get(cfg.siteDirectory+'snippet/getSnippetList', function(req, res, next) {

       var query = req.query,callback='';
       if(req.query.callback){
            callback=query.callback;
            delete query.callback;
       } 
       SnippetsModel.Snippets.find(query,function(err,snippets){
            if(err) res.jsonp([])
            res.charset = 'utf-8';
            res.type('text/javascript');
            
            var snippetType = [];
            var resData = {};
            // 获取片断类型
            snippets.forEach(function(d){
                if(d.typeId){
                    snippetType.push(d.typeId+'|'+d.typeName);
                }
            });
            snippetType = _.uniq(snippetType);
            // 初始化返回值
            snippetType.forEach(function(d){
                var typeData = d.split('|'); 
                resData[typeData[0]] = {name:typeData[1],list:[]};
            })

            snippets.forEach(function(d){
                if(resData[d.typeId]){
                    resData[d.typeId]["list"].push({
                        _id:d._id,
                        name:d.name,
                        viewType:d.viewType
                    })
                }
            });
            resData = callback?callback + '(' + JSON.stringify(resData) + ')' : resData;
            // res.jsonp(resData)
            res.send(resData);
            res.end();

            // req.query.callback=callback;
            // res.jsonp(snippet)
       })
    });

    app.get(cfg.siteDirectory+'snippet/', function(req, res, next) {
       SnippetsModel.Snippets.find().sort({created: -1}).execFind(function(err,snippet){
            res.render('fileList',{
                type:"snippetList",
                _root:req.originalUrl,
                title: 'Snippet list',
                siteUrl: cfg.siteUrl,
                blogRoot: cfg.blogRoot,
                body: snippet
            });
       });
    });
}

module.exports = snippetsController;