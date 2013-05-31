 var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Snippets = new Schema({
        name: String,
        style:String,
        html:String,
        script:String,
        tags:Array
       })
var Tags = new Schema({
        name: String,
        count:Number
       })

exports.Snippets = mongoose.model('Snippets', Snippets);
exports.Tags = mongoose.model('Tags', Tags);
