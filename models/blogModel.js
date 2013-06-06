var mongoose = require('../node_modules/mongoose');
var Schema = mongoose.Schema;
var Blog = new Schema({
        title: String,
        path:String,
        created:{
        	name:String,
        	date:Date
        },
        like:Number
       })

exports.Blog = mongoose.model('Blog', Blog);