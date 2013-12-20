/*
 * @Author      changbin.wangcb
 * @Date        2013.10.09
 * @Description 页面结构渲染
 */

define(['jquery', 'knockout', 'template', 'article', 'request', 'sidebar', 'mapping'], 
       function($, ko, template, article, request, sidebar, mapping){
    "use strict";

    var win = $(window);

    function Section( data, sTmpl, aTmpl, aData ){
        return new Section.prototype.init(data, sTmpl, aTmpl, aData);
    }

    Section.prototype = {
        constructor: Section,
        init: function(data, sTmpl, aTmpl, aData){
            this.sectionTmpl = sTmpl;
            this.articleTmpl = aTmpl;
            this.articleData = aData;

            this.render(data, aTmpl);
            this.bind();
            pageClose();
        },
        /**
         * 渲染
         * @return {[Array]} codeMirror数组,可以缓存做换肤用
         */
        render: function(data){
            var self = this,
                $section,
                section,
                item,
                len = 0;

            self.$container = $('#content div.content-inner');

            // TODO: data空的时候，是不是应该判断，默认生成第一个楼层？

            for( item in data ){
                section = {
                    id   : item,
                    name : data[item].name,
                    list : data[item].list
                };

                $section = $(template(self.sectionTmpl, section)).appendTo(self.$container);

                len = section.list.length;

                if( len ){
                    for( var i = 0; i < len; i++ ){
                        $(template(this.articleTmpl, section.list[i])).insertBefore( $section.find('> footer') );
                    }
                }
            }

            self.lazyload();

            // 结构渲染好后，渲染侧边导航
            Base.sidebar = sidebar($('#sidebar div.sidebar-inner'));
        },
        /**
         * 懒加载
         */
        lazyload: function(){
            var self = this;

            $.use('web-datalazyload', function(){
                var $articles = self.$container.find('> section > article');

                $articles.each(function(idx, elem){

                    var _this = $(elem);

                    // 绑定lazyload事件
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

                                data = mapping.fromJS(resultData);
                                /*data = {
                                    'name': ko.observable(resultData['name']),
                                    'html': ko.observable(resultData['html']),
                                    'style': ko.observable(resultData['style']),
                                    'script': ko.observable(resultData['script']),
                                    'tags': ko.observable(resultData['tags']),
                                    '_v': resultData['_v'],
                                    '_id': resultData['_id'],
                                    'viewType': resultData['viewType'],
                                    'update': ko.observable(resultData['update']),
                                    'created': resultData['created'],
                                    'doc': ko.observable(resultData['doc'])
                                };*/

                                articleItem = article();
                                mirror = articleItem.render(_this, data);

                                // 缓存
                                Base.codeMirrors = Base.codeMirrors.concat(mirror);
                                Base.articles[_this.data('id')] = articleItem;

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
         * 事件绑定
         */
        bind: function(){
            var self         = this,
                $snippetEdit = $('#snippet-edit'),
                $form        = $snippetEdit.find('div.modal-body form'),
                data, id,
                mirrors      = {};

            // 编辑代码片段
            self.$container.on('click', 'section > article > a.edit', function(e){

                var _this = $(this).closest('article');

                e.preventDefault();

                id = _this.data('id');
                data = Base.articles[id].data;
                ko.applyBindings(data, $form[0]);
                $snippetEdit.data('id', id);

                $.use('ui-dialog', function(){

                    $snippetEdit.dialog({
                        fixed  : true,
                        center : true,
                        open   : function(){

                            mirrors = {};

                            $snippetEdit.find('textarea').each(function(idx, elem){

                                var _this = $(elem);

                                mirrors[_this.data('key')] = CodeMirror.fromTextArea(this, {
                                    lineNumbers  : true,
                                    theme        : Base.theme,
                                    mode         : $(this).data('mode'),
                                    lineWrapping : true
                                });

                            });

                        }
                    });

                });
            });
            
            // 新增代码片段
            self.$container.on('click', 'section > header > div.action a.add', function(e){
                var _this   = $(this).closest('section'),
                    idx     = self.$container.find('> section').index(_this);

                e.preventDefault();

                data = mapping.fromJS(self.articleData);
                self.newData = data;
                ko.applyBindings(data, $form[0]);
                $snippetEdit.data('id', '').data('sectionIdx', idx);

                $.use('ui-dialog', function(){

                    $snippetEdit.dialog({
                        fixed: true,
                        center: true,
                        open: function(){

                            mirrors = {};

                            $snippetEdit.find('textarea').each(function(idx, elem){
                                
                                var _this = $(elem);

                                mirrors[_this.data('key')] = CodeMirror.fromTextArea(this, {
                                    lineNumbers  : true,
                                    theme        : Base.theme,
                                    mode         : $(this).data('mode'),
                                    lineWrapping : true
                                });

                            });

                        }
                    });

                });
            });
            
            // 关闭
            $('button.close, a.btn-close', $snippetEdit).click(function(e){

                e.preventDefault();

                $snippetEdit.dialog('close');

            });

            // 提交
            $('a.btn-primary', $snippetEdit).click(function(e){
                var dtd,
                    id = $snippetEdit.data('id'),
                    articleItem, param;

                e.preventDefault();

                dtd = $.Deferred();
                
                if( id !== '' ){

                    // 编辑
                    articleItem = Base.articles[id];
                    param = mapping.toJS(articleItem.data);

                    param = form2obj(param);

                    // TODO:如果片段的名字改了，要同步改sidebar和isAdd
                    articleItem.edit(dtd, param, function(){
                        var key,
                            keys,
                            obj;

                        for( var item in articleItem.mirrors ){

                            key = item;

                            if( key.indexOf('.') > -1 ){
                                keys = key.split('.');

                                for( var i = 0, l = keys.length - 1; i < l; i++ ){
                                    obj = param[keys[i]];
                                }

                                key = keys[l];
                            }else{
                                obj = param;
                            }

                            articleItem.mirrors[item].setValue(obj[key]);
                        }   

                    });

                }else{

                    // 添加
                    articleItem = article();
                    param = mapping.toJS(self.newData);

                    param = form2obj(param);

                    articleItem.add(dtd, data, /*$snippetEdit.data('sectionIdx')*/ function(result){
                        var article, $article, rdtd, 
                            id = result._id, 
                            obj,
                            mirror,
                            $section;
                
                        self.newData['_id'](id);
                        self.newData = mapping.fromJS(param);

                        // 新建article
                        rdtd = $.Deferred();
                        obj = {
                            'id': id,
                            'name': self.newData['name'](),
                            'type': self.newData['viewType']() == '单列' ? 'n' : 'col-2'
                        };

                        $section = $('#content div.content-inner > section').eq($snippetEdit.data('sectionIdx'));
                        $article = $(template(self.articleTmpl, obj)).insertBefore( $section.find('footer') );

                        // 往里面加值
                        $article.data('id', id);
                        Base.codeMirrors = Base.codeMirrors.concat(mirror);
                        Base.articles[id] = articleItem;

                        mirror = articleItem.render($article, self.newData);
                        dataModel[$section.attr('id')].list.push(obj);

                        // 改变isAdd
                        isAdd(true);
                    });

                }

                dtd.done(function(){

                    $snippetEdit.dialog('close');

                });
            });
            
            // 将form转换为对象
            function form2obj(data){
                var $ipts = $form.find('input[data-key]'),
                    $txts = $form.find('textarea[data-key]');

                $ipts.each(function(idx, ele){
                    var _this = $(ele),
                        key   = _this.data('key'),
                        type  = _this.attr('type'),
                        keys  = [],
                        obj   = data;

                    if( key.indexOf('.') > -1 ){
                        keys = key.split('.');

                        for( var i = 0, l = keys.length - 1; i < l; i++ ){
                            obj = obj[keys[i]];
                        }

                        key = keys[l];
                    }

                    switch(type){
                        case 'text':
                            obj[key] = _this.val();
                            break;
                        case 'radio':
                        case 'checkbox':
                            _this.is(':checked') && (obj[key] = _this.val()); 
                            break;
                        default:
                            break;
                    };
                });

                $txts.each(function(idx, ele){
                    var _this = $(ele),
                        key = _this.data('key'),
                        keys = [],
                        obj = data;

                    if( key.indexOf('.') > -1 ){
                        keys = key.split('.');

                        for( var i = 0, l = keys.length - 1; i < l; i++ ){
                            obj = obj[keys[i]];
                        }

                        key = keys[l];
                    }

                    obj[key] = mirrors[_this.data('key')].getValue();
                });

                return data;
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
                
                return "正在保存新增的内容，请稍候！";

            }

        });

        // 保存文档
        $save.on('click', function(){
            var dtd;

            if( !Base.isAdd ){
                return;
            }
            
            // 读取文档html
            dtd = $.Deferred();
            request(location.pathname, null, dtd, 'html');
            $.when(dtd).done(function(result){

                // 正则替换sidebar
                var html = result,
                    $sidebar = $('#sidebar'),
                    reg = /(<script type="text\/javascript" id="data-model">)[\s\S]*(<\/script>)/g,
                    adtd, param;

                html = result;
                html = html.replace(reg, "$1" + JSON.stringify(dataModel) + "$2");console.log(JSON.stringify(dataModel),html);

                // 保存新的文档
                adtd = $.Deferred();
                param = {
                    'action': 'edit',
                    '_ajax': true,
                    'content': html,
                    'path': location.pathname
                };

                /*request('/blog/do', param, adtd, 'html' ,'post');
                $.when(adtd).done(function(result){

                    isAdd(false);

                }).fail(function(){

                });*/

            }).fail(function(){

            });
        });
    }

    Section.prototype.init.prototype = Section.prototype;

    return Section;
});