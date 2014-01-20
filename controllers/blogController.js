var BlogModel = require('../models/blogModel');
var fs = require('fs');
var sys={fileOpen:[]};
var iconv = require('../node_modules/iconv-lite');
var blogController = function(app, mongoose, cfg) {
    //文件新建
    app.get(cfg.siteDirectory+'blog/add', function(req, res, next) {
        if(!req.session.user){
            res.redirect('/user/login');
        }
        res.render('blog', {
            title: "Blog-add",
            siteUrl: cfg.siteUrl,
            blogRoot:cfg.blogRoot,
            action:'add'
        });
    });

    //文件编辑(所有文件)
    app.get('*.html|*.md', function(req, res, next) {
       if(req.query&&req.query.edit=='true'){
            if(!req.session.user){
                res.redirect('/user/login');
            }
            // 文件同时编辑锁定问题
            // console.log(sys)
            // console.log(req.path+' is opening')
            // sys.fileOpen.push(req.path)
            var content = fs.readFileSync(cfg.root + req.path);
            content = iconv.decode(content, cfg.encode);
            var blogTitle='';
            BlogModel.Blog.findOne({path:req.path},function (err, blog) {
                if(blog) blogTitle= blog.title||'';     
                res.render('blog', {
                    title: "Blog-edit",
                    siteUrl: cfg.siteUrl,
                    blogRoot:cfg.blogRoot,
                    blogTitle:blogTitle,
                    content:content,
                    path:req.path,
                    action:'edit'
                });
            })
            
       }else{
            next();
       }
    });

    //blog下预览文件列表
    app.get(cfg.blogRoot+'*', function(req, res, next) {
        var str = scan(cfg.root + req.originalUrl.replace(cfg.siteDirectory,''));
        if(str.length>0){
            res.render('fileList',{
                type:"blogList",
                _root:req.originalUrl,
                title: 'File list',
                siteUrl: cfg.siteUrl,
                blogRoot: cfg.blogRoot,
                body: str
            });
        }else{
            next();
        }
            
    });

    //文件处理
    app.all(cfg.siteDirectory+'blog/do', function(req, res, next) {
        if(!(req.body.action)){
            res.end('Wrong argument');
            return;
        }
        var filePath = '';
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

        if(req.body.action=='add'){
            //文件路径，包含后缀
            filePath = cfg.blogRoot+req.body.fileName + req.body.type;
            var blogModel = new BlogModel.Blog({
                title: req.body.title,
                path: filePath
            })    
        }else{
            filePath = req.body.path;
        }  
        //文件写入
            var buffer = new Buffer(req.body.content.length);
            content = iconv.decode(req.body.content, cfg.encode);
            fs.writeFile(cfg.root+filePath,content ,function(e) {
                if (e) throw e;
                //fs.closeSync(fd);
                if(req.body.action=='add'){
                    blogModel.save(function(err, data) {
                        if(err) throw err;
                        console.log('create blog success');
                        if(isAjax){
                            res.json(data);
                        }else{
                            res.redirect(cfg.blogRoot + req.body.fileName + req.body.type);
                        }
                    });
                }else if(filePath.indexOf(cfg.blogRoot)>-1){
                     BlogModel.Blog.findOneAndUpdate({path:filePath},{title:req.body.title},{upsert:true},function(err,data){
                        if(err) throw err;
                        console.log('edit blog success')
                        if(isAjax){
                            res.json(data);
                        }else{
                            res.redirect(filePath);
                        }
                     })
                    
                }else{
                    res.redirect(filePath);
                }
            })
        
    });
    app.get(cfg.siteDirectory+'blog/get_posts', function(req, res, next) {
        var query = BlogModel.Blog.find({})
        query.execFind(function(err, posts) {
            res.jsonp(posts)
        });
    })
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
                        src: files[i]+'/',
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
module.exports = blogController;