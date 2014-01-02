/*
 * @Author      changbin.wangcb
 * @Date        2013-10-09
 * @Description LightWeb-´úÂëÆ¬¶Î
 */

require.config({
	baseUrl: 'js',
	paths: {
		jquery   : '//style.c.aliimg.com/fdevlib/js/fdev-v4/core/fdev-min'
	},
	deps: ['jquery'],
	enforceDefine: true
});

require(['jquery', 'header', 'sidebar'], function($, header, sidebar){
	"use strict";

	$(function(){
		var dtd = $.Deferred();

		header();
		sidebar($('#sidebar div.sidebar-inner'));
	});
});  	