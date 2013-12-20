/*
 * @Author      changbin.wangcb
 * @Date        2013-10-09
 * @Description LightWeb-代码片段
 */

require.config({
	baseUrl: 'js',
	paths: {
		jquery: '//style.c.aliimg.com/fdevlib/js/fdev-v4/core/fdev-min',
		knockout: 'lib/knockout',
		mapping: 'lib/mapping'
	},
	deps: ['jquery', 'knockout'],
	enforceDefine: true
});

require(['jquery', 'header', 'section'], function($, header, section){
	"use strict";

	var sectionTmpl =  '<section id="#{id}">\
							<header class="clearfix">\
								<h2>#{name}</h2>\
								<div class="action">\
						        	<a href="#" title="新增代码片段" class="add"><i class="icon-plus"></i>ADD</a>\
						        </div>\
						    </header>\
						    <footer>\
						    	<div class="action">\
						    		<a href="#" title="新增代码片段分组" class="add"><i class="icon-plus"></i>ADD</a>\
						    	</div>\
						    </footer>\
						</section>',
		// TODO: 单列的情况还未支持
		articleTmpl =  '<article class="code-mirror #{type}" id="a-#{id}" data-id="#{id}">\
		                    <h3>#{name}</h3>\
		                    <a href="#" class="edit"><i class="icon-edit"></i>edit</a>\
		                    <!--ko template: {name: "temp-article-col-2"}--><!--/ko-->\
		                </article>',
		articleData = {
			"_id"      : '',
			"name"     : '',
			"html"     : '',
			"style"    : '',
			"script"   : '',
			"tags"     : '',
			"viewType" : '双列',
            "doc"	   : {
				"docContent" : '',
				"docType"    : 'md'
            }
		},
		sectionItem;

	$(function(){
		header();
		sectionItem = section(dataModel, sectionTmpl, articleTmpl, articleData);
	});
});  	