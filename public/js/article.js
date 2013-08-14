/*
 * @Author      changbin.wangcb
 * @Date        2013.06.26
 * @Description �ĵ���Ⱦ
 */

jQuery.namespace('lightWeb');
(function ($, win, doc, LW) {
    var win = $(win),
        doc = $(doc),
        tmpl = '<article class="code-mirror #{type}" id="a-#{id}" data-id="#{id}">\
                    <h3>#{name}</h3>\
                    <a href="#" class="edit"><i class="icon-edit"></i>edit</a>\
                    <!--ko template: {name: "temp-article-col-2"}--><!--/ko-->\
                </article>';

    function Article(dtd, list){
        return new Article.prototype.init(dtd, list);
    }

    Article.prototype = {
        constructor: Article,
        init: function(dtd, list){
            this.dtd = dtd;
            this.render(list);
        },
        /**
         * ��Ⱦ
         * @return {[Array]} codeMirror����,���Ի�����������
         */
        render: function(list){
            var self = this,
                sections = $('#content div.content-inner > section'),
                $article,
                section,
                i, l = list.length, idx;

            for( i = 0; i < l; i++){
                section = list[i];

                for( idx in section ){
                    $article = $(_template(tmpl, section[idx]));
                    $article.appendTo(sections.eq(i));
                }
            }

            self.dtd.resolve($article);
        }
    };

    Article.prototype.init.prototype = Article.prototype;

    /**
     * ģ����Ⱦ
     * @param  {String}         tpl  ģ��
     * @param  {Object}         data ����
     * @return {HTML String}    tpl  
     */
    function _template(tpl, data) {
        for(var each in data){
            tpl = tpl.replace(new RegExp('#\{' + each + '\}', 'g'), data[each]);
        }
        return tpl;
    }

    LW.Article = Article;
})(jQuery, window, document, lightWeb);