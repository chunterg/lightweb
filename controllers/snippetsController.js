var SnippetsModel = require('../models/snippetsModel');
var snippetsController = function (app,mongoose,cfg) {
    //增加新片断
    app.get(cfg.siteDirectory+'snippet/add', function(req, res, next) {
        res.render('snippets',{
            title:"Add new snippets",
            siteUrl:cfg.siteUrl,
            action:"add"
        });
    });

    //编辑片断
    app.get(cfg.siteDirectory+'snippet/:id/edit', function(req, res, next) {
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
                tags:snippet.tags
            });
        });

    });

    //片断处理函数
    app.all(cfg.siteDirectory+'snippet/do', function(req, res, next) {
        var tags = req.body.tag+'';
        var _d = new Date();
        var dataReq = {
                    name:req.body.name,
                    html:req.body.html,
                    style:req.body.style,
                    script:req.body.script,
                    doc:{
                        docType:req.body.docType,
                        docContent:req.body.docContent
                    },
                    tags:req.body.tag?req.body.tag.split(','):[]
                }
        if(req.body.action=='add'){
            dataReq.created = {
                        name:'chunterg',
                        date:_d.getTime()
                    }
            var snippetsModel = new SnippetsModel.Snippets(dataReq)
        }
        if(tags){
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
            snippetsModel.save( function( err, user ){
                    console.log('create snippet success')
                    res.redirect( cfg.siteDirectory+'snippet/' );
                  });
        }else{
            SnippetsModel.Snippets.findOneAndUpdate({_id:req.body._id},dataReq,function(err,data){
                    if(err) throw err;
                    console.log('edit snippet success')
                    res.redirect( cfg.siteDirectory+'snippet/getSnippet?_id='+req.body._id );
               })
        }   
    });

    app.get(cfg.siteDirectory+'snippet/getSnippet', function(req, res, next) {
       var query = req.query;
       SnippetsModel.Snippets.find(query,function(err,snippet){
            res.jsonp(snippet)
       })
    });

    app.get(cfg.siteDirectory+'snippet/', function(req, res, next) {
       SnippetsModel.Snippets.find(function(err,snippet){
            res.render('fileList',{
                type:"snippetList",
                _root:req.originalUrl,
                title: 'Snippet list',
                siteUrl: cfg.siteUrl,
                blogRoot: cfg.blogRoot,
                body: snippet
            });
       })
    });
}

module.exports = snippetsController;