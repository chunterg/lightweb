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

            // dropdown�¼�
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

    // �����ش���Ƭ��
    Parts.lazyload = {
        init: function(){
            $.use('web-datalazyload', function(){
                var container = $('#content div.content-inner'),
                    $articles = container.find('> section > article');

                $articles.each(function(idx, elem){

                    var _this = $(elem);

                    // ��lazyload�¼�
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

                                // ����
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

    // ��ȡcodeMirror theme
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

    // ����Ƭ��
    Parts.snippet = {
        init: function(){
            this.container = $('#content div.content-inner');
            this.bind();
        },
        // �¼���
        bind: function(){
            var self = this,
                $snippetEdit = $('#snippet-edit'),
                data, id,
                mirrors = [];

            // �༭����Ƭ��
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
            
            // ��������Ƭ��
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
            
            // �ر�
            $('button.close, a.btn-close', $snippetEdit).click(function(e){

                e.preventDefault();

                $snippetEdit.dialog('close');

            });

            // �ύ
            $('a.btn-primary', $snippetEdit).click(function(e){
                var dtd,
                    id = $snippetEdit.data('id'),
                    snippet, param;

                e.preventDefault();

                dtd = $.Deferred();
                
                if( id !== '' ){

                    // �༭
                    snippet = Base.snippets[id];

                    // TODO:���Ƭ�ε����ָ��ˣ�Ҫͬ����sidebar��isAdd

                    data['name']($('#sp-name').val());
                    data['html'](mirrors[0].getValue());
                    data['style'](mirrors[1].getValue());
                    data['script'](mirrors[2].getValue());
                    data['doc']({'docContent': mirrors[3].getValue(), 'docType': data['doc']().docType});
                    data['tags']($('#sp-tag').val());

                    snippet.edit(dtd, data);

                }else{

                    // ���
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

    // ����Ƭ�η���
    Parts.snippetGroup = {
        init: function(){
            
        }
    };

    // ҳ��ˢ�¹ر�ʱ�������������Ƭ��,�ȱ���
    Parts.pageClose = {
        init: function(){
            var $save = $('#header div.save');

            win.on('beforeunload', function(e) {

                if( Base.isAdd ){
                    
                    return "���ڱ������������ݣ����Ժ�";

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
                request(location.pathname, null, dtd, 'html');
                $.when(dtd).done(function(result){

                    // �����滻sidebar
                    var html = result, sidebarHtml,
                        $sidebar = $('#sidebar'),
                        reg = /(<aside id="sidebar" class="sidebar">)[\s\S]*(<\/aside>)/g,
                        adtd, param;

                    html = result;
                    sidebarHtml = $sidebar.html();
                    sidebarHtml = sidebarHtml.replace(/class="current"/g, '');
                    html = html.replace(reg, "$1" + sidebarHtml + "$2");

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

    // jsonp����
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