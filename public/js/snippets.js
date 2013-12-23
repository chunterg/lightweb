/*
 * @Author      changbin.wangcb
 * @Date        2013-10-09
 * @Description LightWeb-����Ƭ��
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

require(['jquery', 'header', 'section', 'knockout'], function($, header, section, ko){
	"use strict";

	var sectionTmpl =  '<section id="{{id}}">\
							<header class="clearfix">\
								<h2>{{name}}</h2>\
								<div class="action">\
						        	<a href="#" title="��������Ƭ��" class="add"><i class="icon-plus"></i>ADD</a>\
						        </div>\
						    </header>\
						    <footer>\
						    	<div class="action">\
						    		<a href="#" title="��������Ƭ�η���" class="add"><i class="icon-plus"></i>ADD</a>\
						    	</div>\
						    </footer>\
						</section>',
		// TODO: ���е������δ֧��
		articleTmpl =  '<article class="code-mirror {{type}}" id="a-{{id}}" data-id="{{id}}">\
		                    <h3 data-bind="text: name">{{name}}</h3>\
		                    <a href="#" class="edit"><i class="icon-edit"></i>edit</a>\
		                    {{#if type}}\
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
			"viewType" : ko.observable('˫��'),
            "doc"	   : {
				"docContent" : ko.observable(''),
				"docType"    : ko.observable('.md')
            }
		},
		sectionItem;

	$(function(){
		header();
		sectionItem = section(dataModel, sectionTmpl, articleTmpl, articleData);
	});
});  	