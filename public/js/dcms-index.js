/*
 * @Author      changbin.wangcb
 * @Date        2013.08.08
 * @Description design
 */

(function($, Design){
    window.designDCMS = {};

    designDCMS.Design = Design;

    $(function(){
        $('#content-wrap div.mod-action .confirm').on('click', function(){console.log(1);
            parent.window.ok(Design.getModel(), Design.getHTML());
        });
    });
})(jQuery, FE.tools.design);