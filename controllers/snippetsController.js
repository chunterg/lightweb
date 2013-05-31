var SnippetsModel = require('../models/snippetsModel');
snippetsController = function (app,mongoose,cfg) {
    app.get('/snippets/add_new', function(req, res, next) {
        res.render('snippets',{
            title:"add new snippets",
            siteurl:cfg.siteUrl
        });
    });

    app.post('/snippets/add_new_submit', function(req, res, next) {
        var tags = req.body.tag+'';
        var snippetsModel = new SnippetsModel.Snippets({
                name:req.body.name,
                html:req.body.html,
                style:req.body.style,
                script:req.body.script,
                tags:req.body.tag
            })
        if(tags){
            var tagModel = SnippetsModel.Tags;
            tags = tags.split(',');
            tags.forEach(function (tag) {
               tagModel.findOne({name:tag},function(err,data){
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
                         console.log(2222)
                        _tagModel.save( function( err, data ){
                            console.log('create tag success')
                        });
                    }
               })
            })
        }
        snippetsModel.save( function( err, user ){
                console.log('create snippet success')
                res.redirect( '/snippets/get_posts' );
              });
    });

    app.get('/snippets/get_posts', function(req, res, next) {
       var query = SnippetsModel.Snippets.find({})
       query.execFind(function(err, posts) {
            res.jsonp(posts)
        });
    });
}

module.exports = snippetsController;