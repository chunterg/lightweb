
var User = require('../models/userModel');
var crypto = require('crypto');
var userController = function (app, mongoose, cfg) {
    var User = mongoose.model('User');
    app.all('/user/login/?', function(req, res, next) {
        if(req.session.user||req.cookies.user){
            res.redirect('/');
        }
        if(req.body.username&&req.body.password){
            var username = req.body.username;
            var password = req.body.password;
            var password = crypto.createHash('md5').update(password).digest("hex");
            User.findOne({username: username, password: password}, function(err, userInfo) {
                if (err) {
                    res.status(500);
                    res.render('500', {
                        err: err,
                        siteUrl: cfg.siteUrl
                    });
                } else {
                    if (userInfo) {
                        req.session.user = userInfo.username;
                        res.redirect('/');
                    } else {
                        res.render('login', {
                            action:'login',
                            error:true,
                            title: 'Login failed',
                            error: 'Incorrect username/passord',
                            siteUrl: cfg.siteUrl
                        });
                    }
                }
            });  
        }else{
            res.render('login', {
                action:'login',
                title: '用户登录',
                error:false,
                siteUrl: cfg.siteUrl
            });
        }
        
    });

    app.all('/user/register/?', function(req, res, next) {
        if(req.body.username&&req.body.password){
            var username = req.body.username;
            var password = req.body.password;
            var userModel = new User();
            userModel.password = crypto.createHash('md5').update(password).digest("hex");
            userModel.username = username;
            userModel.save(function(err) {
                if (err) throw err;
                req.session.user = userInfo.username;
                res.redirect('/');
            });   
        }else{
            res.render('login', {
                action:'register',
                title: '用户注册',
                siteUrl: cfg.siteUrl
            });
        }
        
    });


    app.get('/user/logout/?', function(req, res, next) {
        if (req.session) {
            req.session=null;
        }
        res.redirect('/');
    });
}

module.exports = userController;
