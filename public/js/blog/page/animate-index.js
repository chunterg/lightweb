/*
 * @Author      changbin.wangcb
 * @Date        2013.07.06
 * @Description animate.css examples
 */

jQuery.namespace('lightWeb');
(function ($, win, doc, LW) {
    var content = {
    		init: function(){
                for(var i in this.Parts){
                    this.Parts[i].init();
                }
    		}
    	};

    var Parts = (content.Parts = {});

    /* nav */
    Parts.nav = {
    	init: function(){
    		var container = $('#example');

            container.on('mouseenter', 'div.example', function(){
                var _this = $(this).find('div.box');

                _this.addClass('animated ' + _this.data('animate'));
            }).on('mouseleave', 'div.example', function(){
                var _this = $(this).find('div.box');

                _this.removeClass('animated ' + _this.data('animate'));
            });
    	}
    };

    $(function() {
        content.init();
    });
})(jQuery, window, document, lightWeb);