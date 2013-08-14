/*
 * @Author      changbin.wangcb
 * @Date        2013.04.22
 * @Description content
 */

jQuery.namespace('lightWeb');
(function ($, win, doc, LW) {
    var content = {
    		init: function(){
                var self = this,
                    dtd = $.Deferred();

                Base.sidebar = LW.sidebar($('#sidebar div.sidebar-inner'));
                Base.sidebar.render(dtd);

                dtd.done(function(){

                    for(var i in self.Parts){

                        self.Parts[i].init();

                    }

                });
    		}
    	},
        win = $(win),
        doc = $(doc),
        Base = {
            sidebar: null,
            domain: 'http://okbeng:88',
            snippets: {},
            codeMirrors: [],
            theme: null,
            isAdd: false
        };

    LW.Base = Base;

    var Parts = (content.Parts = {});

    /* nav */
    Parts.nav = {
    	init: function(){
    		var container = $('#header'),
                dropdowns = $('nav li.dropdown', container);

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

            $('nav a.edit', container).attr('href', 'http://' + location.host + location.pathname + '?edit=true');            
    	}
    };

    // 懒加载代码片段
    Parts.lazyload = {
        init: function(){
            $.use('web-datalazyload', function(){
                var container = $('#content div.content-inner'),
                    $articles = container.find('> section > article');

                $articles.each(function(idx, elem){

                    var _this = $(elem);

                    // 绑定lazyload事件
                    FE.util.datalazyload.bind(_this, function(){

                        var snippet,
                            dtd,
                            param = {},
                            mirror;

                        param._id = _this.data('id');
                        dtd = $.Deferred();
                        LW.request('/snippet/getSnippet', param, dtd);

                        $.when(dtd).done(function(result){

                            var resultData = result[0],
                                data;

                            if( resultData ){

                                data = {
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
                                };

                                snippet = LW.Snippet();
                                mirror = snippet.render(_this, data);

                                // 缓存
                                Base.codeMirrors = Base.codeMirrors.concat(mirror);
                                Base.snippets[_this.data('id')] = snippet;

                            }

                        });

                    });

                });

                FE.util.datalazyload.register({

                    containers : $('#content')

                });
            });
        }
    };

    // 获取codeMirror theme
    Parts.theme = {
        init: function(){
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
        }
    };

    // 代码片段
    Parts.snippet = {
        init: function(){
            this.container = $('#content div.content-inner');
            this.bind();
        },
        // 事件绑定
        bind: function(){
            var self = this,
                $snippetEdit = $('#snippet-edit'),
                data, id,
                mirrors = [];

            // 编辑代码片段
            self.container.on('click', 'section > article > a.edit', function(e){

                var _this = $(this).closest('article'),
                    $temp = $snippetEdit.find('div.modal-body form');

                e.preventDefault();

                id = _this.data('id');
                data = Base.snippets[id].data;
                ko.applyBindings(data, $temp[0]);
                $snippetEdit.data('id', id);

                $.use('ui-dialog', function(){

                    $snippetEdit.dialog({
                        fixed: true,
                        center: true,
                        open: function(){

                            $snippetEdit.find('textarea').each(function(idx, elem){

                                mirrors[idx] = CodeMirror.fromTextArea(this, {
                                    lineNumbers: true,
                                    theme: Base.theme,
                                    mode: $(this).data('mode'),
                                    lineWrapping: true
                                });

                            });

                        }
                    });

                });
            });
            
            // 新增代码片段
            self.container.on('click', 'section > header > div.action a.add', function(e){
                var _this = $(this).closest('section'),
                    $temp = $snippetEdit.find('div.modal-body form'),
                    idx = self.container.find('> section').index(_this);

                e.preventDefault();

                data = {
                    "_id": ko.observable(""),
                    "name": ko.observable(""),
                    "html": ko.observable(""),
                    "style": ko.observable(""),
                    "script": ko.observable(""),
                    "tags": ko.observable([]),
                    "viewType": ko.observable(""),
                    "doc": ko.observable({
                      "docContent": "",
                      "docType": ""
                    })
                };
                ko.applyBindings(data, $temp[0]);
                $snippetEdit.data('id', '').data('sectionIdx', idx);

                $.use('ui-dialog', function(){

                    $snippetEdit.dialog({
                        fixed: true,
                        center: true,
                        open: function(){

                            $snippetEdit.find('textarea').each(function(idx, elem){

                                mirrors[idx] = CodeMirror.fromTextArea(this, {
                                    lineNumbers: true,
                                    theme: Base.theme,
                                    mode: $(this).data('mode'),
                                    lineWrapping: true
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
                    snippet, param;

                e.preventDefault();

                dtd = $.Deferred();
                
                if( id !== '' ){

                    // 编辑
                    snippet = Base.snippets[id];

                    // TODO:如果片段的名字改了，要同步改sidebar和isAdd

                    data['name']($('#sp-name').val());
                    data['html'](mirrors[0].getValue());
                    data['style'](mirrors[1].getValue());
                    data['script'](mirrors[2].getValue());
                    data['doc']({'docContent': mirrors[3].getValue(), 'docType': data['doc']().docType});
                    data['tags']($('#sp-tag').val());

                    snippet.edit(dtd, data);

                }else{

                    // 添加
                    snippet = new LW.Snippet();

                    data['name']($('#sp-name').val());
                    data['html'](mirrors[0].getValue());
                    data['style'](mirrors[1].getValue());
                    data['script'](mirrors[2].getValue());
                    data['doc']({'docContent': mirrors[3].getValue(), 'docType': $('input:radio[name="doc-type"]:checked').val()});
                    data['tags']($('#sp-tag').val());
                    data['viewType']($('input:radio[name="view-type"]:checked').val());

                    snippet.add(dtd, data, $snippetEdit.data('sectionIdx'));

                }

                dtd.done(function(){

                    $snippetEdit.dialog('close');

                });
            });
        }
    };

    // 代码片段分组
    Parts.snippetGroup = {
        init: function(){
            
        }
    };

    // 页面刷新关闭时如果有新增代码片段,先保存
    Parts.pageClose = {
        init: function(){
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
                    var html = result, sidebarHtml,
                        $sidebar = $('#sidebar'),
                        reg = /(<aside id="sidebar" class="sidebar">)[\s\S]*(<\/aside>)/g,
                        adtd, param;

                    html = result;
                    sidebarHtml = $sidebar.html();
                    sidebarHtml = sidebarHtml.replace(/class="current"/g, '');
                    html = html.replace(reg, "$1" + sidebarHtml + "$2");

                    // 保存新的文档
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

                });
            });
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

    LW.isAdd = isAdd;

    // jsonp请求
    function request(url, opts, dtd, type, method){
        var self = this,
            param = {};
        
        if( !url ){
            return;
        }
        
        $.extend(true, param, opts);
        
        $.ajax({
            url: Base.domain + url,
            dataType: type || 'jsonp',
            data: param,
            type: method || 'get',
            success: function(res){

                dtd.resolve(res);

            },  
            error: function(){

                dtd.reject();

            }
        });
    }

    LW.request = request;

    $(function() {
        content.init();
    });
})(jQuery, window, document, lightWeb);