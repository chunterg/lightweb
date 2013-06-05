var mongoose = require('../node_modules/mongoose');
var Schema = mongoose.Schema;
var Snippets = new Schema({
        name: String,
        style:String,
        html:String,
        script:String,
        like:Number,
        doc:{
        	docType:{
        		type:String,
        		default:"md"
        	},
        	docContent:String
        },
        tags:Array,
        created:{
        	name:String,
        	date:Date
        },
        revision:Array 
       })
var snippetTags = new Schema({
        name: String,
        count:Number,
        snippetIds:Array
       })

exports.Snippets = mongoose.model('Snippets', Snippets);
exports.Tags = mongoose.model('Tags', snippetTags);
