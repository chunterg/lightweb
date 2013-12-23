/*
 * @Author      changbin.wangcb
 * @Date        2013.10.09
 * @Description ҳ��ṹ��Ⱦ
 */

define(['jquery', 'knockout', 'article', 'request', 'sidebar', 'mapping'], 
       function($, ko, article, request, sidebar, mapping){
    "use strict";

    var win = $(window);

    function Section( data, sTmpl, aTmpl, aData ){
        return new Section.prototype.init(data, sTmpl, aTmpl, aData);
    }

    Section.prototype = {
        constructor: Section,
        init: function(data, sTmpl, aTmpl, aData){
            this.sectionTmpl = Handlebars.compile(sTmpl);
            this.articleTmpl = Handlebars.compile(aTmpl);
            this.articleData = aData;

            this.render(data, aTmpl);
            this.bind();
            pageClose();
        },
        /**
         * ��Ⱦ
         */
        render: function(data){
            var self = this,
                $section,
                section,
                item,
                len = 0;

            self.$container = $('#content div.content-inner');

            // TODO: data�յ�ʱ���ǲ���Ӧ���жϣ�Ĭ�����ɵ�һ��¥�㣿

            for( item in data ){
                section = {
                    id   : item,
                    name : data[item].name,
                    list : data[item].list
                };

                $section = $(self.sectionTmpl(section)).appendTo(self.$container);

                len = section.list.length;

                if( len ){
                    for( var i = 0; i < len; i++ ){
                        $(self.articleTmpl(section.list[i])).insertBefore( $section.find('> footer') );
                    }
                }
            }

            self.lazyload();

            // �ṹ��Ⱦ�ú���Ⱦ��ߵ���
            Base.sidebar = sidebar($('#sidebar div.sidebar-inner'));
        },
        /**
         * ������
         */
        lazyload: function(){
            var self = this;

            $.use('web-datalazyload', function(){
                var $articles = self.$container.find('> section > article');

                $articles.each(function(idx, elem){

                    var _this = $(elem);

                    // ��lazyload�¼�
                    FE.util.datalazyload.bind(_this, function(){

                        var articleItem,
                            dtd,
                            param = {},
                            mirror;

                        param._id = _this.data('id');
                        dtd = $.Deferred();
                        request('/snippet/getSnippet', param, dtd);

                        $.when(dtd).done(function(result){

                            var resultData = result[0],
                                data;

                            if( resultData ){

                                data = $.extend({}, self.articleData);
                                data = mapping.fromJS(resultData);

                                articleItem = article();
                                Base.articles[_this.data('id')] = articleItem;
                                mirror = articleItem.render(_this, data);

                                // ����
                                Base.codeMirrors = Base.codeMirrors.concat(mirror);
                            }

                        });

                    });

                });

                FE.util.datalazyload.register({

                    containers : $('#content')

                });
            });
        },
        /**
         * �¼���
         */
        bind: function(){
            var self         = this,
                $snippetEdit = $('#snippet-edit'),
                $sectionAdd  = $('#section-add'),
                $form        = $snippetEdit.find('div.modal-body form'),
                id,
                mirrors      = {};

            // �༭����Ƭ��
            self.$container.on('click', 'section > article > a.edit', function(e){

                var _this = $(this).closest('article');

                e.preventDefault();

                id = _this.data('id');
                ko.applyBindings(Base.articles[id].data, $form[0]);
                $snippetEdit.data('id', id);

                $.use('ui-dialog', function(){

                    $snippetEdit.dialog({
                        // fixed  : true,
                        center : true,
                        open   : function(){

                            mirrors = {};

                            $snippetEdit.find('textarea').each(function(idx, elem){

                                var _this = $(elem);

                                mirrors[_this.data('key')] = CodeMirror.fromTextArea(this, {
                                    lineNumbers       : true,
                                    theme             : Base.theme,
                                    mode              : $(this).data('mode'),
                                    indentUnit        : 4,
                                    lineWrapping      : true,
                                    autoCloseTags     : true,
                                    autoCloseBrackets : true
                                });

                            });

                        }
                    });

                });
            });
            
            // ��������Ƭ��
            self.$container.on('click', 'section > header > div.action a.add', function(e){
                var _this   = $(this).closest('section'),
                    idx     = self.$container.find('> section').index(_this);

                e.preventDefault();

                self.newData = $.extend(true, {}, self.articleData);
                ko.applyBindings(self.newData, $form[0]);
                $snippetEdit.data('id', '').data('sectionIdx', idx);

                $.use('ui-dialog', function(){

                    $snippetEdit.dialog({
                        // fixed: true,
                        center: true,
                        open: function(){

                            mirrors = {};

                            $snippetEdit.find('textarea').each(function(idx, elem){
                                
                                var _this = $(elem);

                                mirrors[_this.data('key')] = CodeMirror.fromTextArea(this, {
                                    llineNumbers       : true,
                                    theme             : Base.theme,
                                    mode              : $(this).data('mode'),
                                    indentUnit        : 4,
                                    lineWrapping      : true,
                                    autoCloseTags     : true,
                                    autoCloseBrackets : true
                                });

                            });

                        }
                    });

                });
            });
            
            // �ر�
            $('div.modal button.close, div.modal a.btn-close').click(function(e){

                e.preventDefault();

                $(this).closest('div.modal').dialog('close');

            });

            // �ύ
            $('a.btn-primary', $snippetEdit).click(function(e){
                var dtd,
                    id = $snippetEdit.data('id'),
                    articleItem, param;

                e.preventDefault();

                dtd = $.Deferred();
                
                if( id !== '' ){

                    // �༭
                    articleItem = Base.articles[id];
                    save();

                    // TODO:���Ƭ�ε����ָ��ˣ�Ҫͬ����sidebar��isAdd
                    articleItem.edit(dtd, function(){
                        if( articleItem.data.oldName !== articleItem.data.name() ){
                            isAdd(true);
                        }
                    });

                }else{

                    // ���
                    articleItem = article();

                    articleItem.add(dtd, self.newData, function(result){
                        var article, $article, 
                            id = result._id, 
                            obj,
                            mirror,
                            $section;
                
                        self.newData['_id'](id);
                        save();

                        // �½�article
                        obj = {
                            'id': id,
                            'name': self.newData['name'](),
                            'type': self.newData['viewType']() == '����' ? '' : 'col-2'
                        };

                        $section = $('#content div.content-inner > section').eq($snippetEdit.data('sectionIdx'));
                        $article = $(self.articleTmpl(obj)).insertBefore( $section.find('footer') );

                        // �������ֵ
                        $article.data('id', id);

                        Base.articles[id] = articleItem;
                        mirror = articleItem.render($article, self.newData);
                        dataModel[$section.attr('id')].list.push(obj);
                        Base.codeMirrors = Base.codeMirrors.concat(mirror);

                        // �ı�isAdd
                        isAdd(true);
                    });

                }

                dtd.done(function(){

                    mirrors = {};
                    $snippetEdit.dialog('close');

                });
            });

            // ��������
            self.$container.on('click', 'section > footer > div.action a.add', function(e){
                var $section = $(this).closest('section'),
                    idx = self.$container.find('> section').index($section);

                e.preventDefault();

                $sectionAdd.data('sectionIdx', idx);

                $.use('ui-dialog', function(){

                    $sectionAdd.dialog({
                        // fixed: true,
                        center: true
                    });

                });
            });

            // ���������ύ
            $('a.btn-primary', $sectionAdd).click(function(e){
                var $name = $('#se-name'),
                    $id = $('#se-id'),
                    name = $name.val().trim(),
                    id = $id.val().trim(),
                    sectionObj = {},
                    section = null,
                    $section;

                e.preventDefault();

                if( name === '' ){
                    $name.val(name).focus();

                    return;
                }

                if( id === '' ){
                    $id.val(id).focus();

                    return;
                }

                sectionObj.name = name;
                sectionObj.list = [];

                dataModel[id] = sectionObj;
                
                section = {
                    id   : id,
                    name : name,
                    list : []
                };

                $section = $(self.sectionTmpl(section)).insertAfter(self.$container.find('> section').eq($sectionAdd.data('sectionIdx')));

                isAdd(true);

                $sectionAdd.dialog('close');
            });

            // ����codemirror��ֵ
            function save(){
                var key;

                for( key in mirrors ){
                    mirrors[key].save();
                    $(mirrors[key].getTextArea()).trigger('change');
                }
            }
        }
    };

    function isAdd(b){
        var $save = $('#header div.save');

        if( b ){
            Base.isAdd = true;
            $save.slideDown();
        }else{
            Base.isAdd = false;
            $save.slideUp();
        }
    }

    function pageClose(){
        var $save = $('#header div.save');

        win.on('beforeunload', function(e) {

            if( Base.isAdd ){
                
                return "ȷ�ϲ�����༭��������";

            }

        });

        // �����ĵ�
        $save.on('click', function(){
            var dtd;

            if( !Base.isAdd ){
                return;
            }
            
            // ��ȡ�ĵ�html
            dtd = $.Deferred();
            request(location.pathname, {}, dtd, 'html');
            $.when(dtd).done(function(result){

                // �����滻sidebar
                var html = result,
                    $sidebar = $('#sidebar'),
                    reg = /(<script type="text\/javascript" id="data-model">)[\s\S]*(<\/script>)/g,
                    adtd, param;

                html = result;
                html = html.replace(reg, "$1" + 'window.dataModel =' + JSON.stringify(dataModel) + ';' + "$2");

                // �����µ��ĵ�
                adtd = $.Deferred();
                param = {
                    'action': 'edit',
                    '_ajax': true,
                    'content': html,
                    'path': location.pathname
                };

                request('/blog/do', param, adtd, 'html' ,'post');
                $.when(adtd).done(function(result){

                    isAdd(false);

                }).fail(function(){

                });

            }).fail(function(){
                console.log('error');
            });
        });
    }

    Section.prototype.init.prototype = Section.prototype;

    return Section;
});