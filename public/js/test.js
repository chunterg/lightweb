/*
 * @Author      changbin.wangcb
 * @Date        2013-10-09
 * @Description LightWeb-´úÂëÆ¬¶Î
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

require(['jquery', 'header', 'lib/esprima'], function($, header, esprima){
	"use strict";

	$(function(){
		window.esprima = esprima;
		header();
	});
});  	