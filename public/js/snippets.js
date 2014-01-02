/*
 * @Author      changbin.wangcb
 * @Date        2013-10-09
 * @Description LightWeb-代码片段
 */

require.config({
	baseUrl: 'js',
	paths: {
		jquery   : '//style.c.aliimg.com/fdevlib/js/fdev-v4/core/fdev-min',
		knockout : 'lib/knockout',
		mapping  : 'lib/mapping'
	},
	deps: ['jquery', 'knockout'],
	enforceDefine: true
});

require(['jquery', 'header', 'section', 'knockout', 'request'], function($, header, section, ko, request){
	"use strict";

	var sectionTmpl =  '<section id="{{id}}">\
							<header class="clearfix">\
								<h2>{{name}}</h2>\
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
		articleTmpl =  '<article class="code-mirror {{viewType}}" id="a-{{_id}}" data-id="{{_id}}">\
		                    <h3 data-bind="text: name">{{name}}</h3>\
		                    <a href="#" class="edit"><i class="icon-edit"></i>edit</a>\
		                    {{#if viewType}}\
		                    	<!--ko template: {name: "temp-article-col-2"}--><!--/ko-->\
		                    {{else}}\
								<!--ko template: {name: "temp-article-n"}--><!--/ko-->\
							{{/if}}\
		                </article>',
		articleData = {
			"_id"      : ko.observable(''),
			"name"     : ko.observable(''),
			"oldName"  : '',
			"html"     : ko.observable(''),
			"style"    : ko.observable(''),
			"script"   : ko.observable(''),
			"tags"     : ko.observable(''),
			"viewType" : ko.observable('col-2'),
            "doc"	   : {
				"docContent" : ko.observable(''),
				"docType"    : ko.observable('.md')
            }
		},
		sectionItem;

	$(function(){
		var dtd = $.Deferred();

		header();
		request('/snippet/getSnippetList', {}, dtd);

		$.when(dtd).done(function(result){
			sectionItem = section(result, sectionTmpl, articleTmpl, articleData);
		});
	});
});  	