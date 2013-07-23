var mongoose = require('../node_modules/mongoose');
var Schema = mongoose.Schema;
var validator = require('../lib/validator');
    var User = new Schema({
        username:{
            type:String,
            validate:[validator({
                length:{
                    min:3,
                    max:20
                }
            }), "username"],
            required:true,
            default: "defaultusername"
        },
        password:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:false
        },
        registerDate:{
            type:Date,
            required:true,
            default: Date.now
        },
        loginDate:{
            type:Date,
            required:false
        }
    });
exports.Blog = mongoose.model('User', User);