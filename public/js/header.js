/*
 * @Author      changbin.wangcb
 * @Date        2013.10.08
 * @Description 头部
 */

define(['jquery', 'module'/*, 'knockout'*/], function($, module/*, ko*/){
    return function(){
        var container = $('#header'),
            dropdowns = $('nav li.dropdown', container);

        window.Base = window.Base || {
            codeMirrors: [],
            articles: []
        };

        Base.getProp = function(obj, prop){
            var keys = prop.split('.');

            for( var i = 0, l = keys.length; i < l; i++ ){
                obj = obj[keys[i]];
            }

            return obj;
        }

        /*Base.observable = function(obj){
            var key, item,
                observableObj = {};

            for( key in obj ){

                item = obj[key]; 
                
                if( typeof item === 'object' ){
                    observableObj[key] = Base.observable(item);
                }else{
                    observableObj[key] = ko.observable(item);
                }
                
            }

            return observableObj;
        }*/

        // dropdown事件
        $('nav', container).on('click.nav-dropdown', 'li.dropdown>a', function(e){

            e.preventDefault();

            $(this).closest('li.dropdown').toggleClass('open');

        });

        $(document).on('click.nav-dropdown', function (ev) {

            var el = $(ev.target),
                dropdown = el.closest('li.dropdown');

            if ( dropdown.length === 0 ) {

                dropdowns.removeClass('open');

            }

        });

        // 页面编辑
        $('nav a.edit', container).attr('href', 'http://' + location.host + location.pathname + '?edit=true');    

        // codeMirror
        $.use("util-storage",function(){

            var STORE = jQuery.util.storage;

            STORE.ready(function(){

                Base.theme = STORE.getItem('lightWebTheme') || 'rubyblue';

            });

            $('#header nav li.theme').on('click', 'ul.dropdown-menu a', function(e){

                var _this = $(this),
                    i, l;

                e.preventDefault();

                for( i = 0, l = Base.codeMirrors.length; i < l; i++ ){

                    Base.codeMirrors[i].setOption('theme', _this.text());

                }

                STORE.ready(function(){

                    STORE.setItem('lightWebTheme', _this.text());

                });
                
            });

        });        
    };
});