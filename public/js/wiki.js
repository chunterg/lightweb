/*
 * @Author      changbin.wangcb
 * @Date        2013.06.26
 * @Description �ĵ���Ⱦ
 */

jQuery.namespace('lightWeb');
(function ($, win, doc, LW) {
    var win = $(win),
        doc = $(doc),
        snippets = LW.Base.snippets;

    function Snippet(options){
        return new Snippet.prototype.init(options);
    }

    Snippet.prototype = {
        constructor: Snippet,
        init: function(options){
            this.options = options;
        },
        // �༭
        edit: function(dtd, data){
            var self = this,
                param;

            param = {
                '_ajax': true,
                'action': 'edit',
                '_id': data['_id'],
                'name': data['name'](),
                'html': data['html'](),
                'style': data['style'](),
                'script': data['script'](),
                'tags': data['tags'](),
                '_v': data['_v'],
                'viewType': data['viewType'],
                'update': data['update'](),
                'created': data['created'],
                'doc': data['doc']()
            };

            // ajax
            LW.request('/snippet/do', param, dtd, 'text' ,'post');

            // ����ɹ��󣬸���codeMirror���ֵ
            $.when(dtd).done(function(result){  

                self.htmlMirror && self.htmlMirror.setValue(data['html']());
                self.styleMirror && self.styleMirror.setValue(data['style']());

            });
        },
        // ����
        add: function(dtd, data, idx){
            var self = this,
                param;

            param = {
                '_ajax': true,
                'action': 'add',
                '_id': data['_id'],
                'name': data['name'](),
                'html': data['html'](),
                'style': data['style'](),
                'script': data['script'](),
                'tags': data['tags'](),
                'viewType': data['viewType'](),
                'doc': data['doc']()
            };

            LW.request('/snippet/do', param, dtd, 'json' ,'post');

            $.when(dtd).done(function(result){

                var article, rdtd, id = result._id, obj;
                
                data['_id'](id);

                // �½�article
                rdtd = $.Deferred();
                obj = {
                    'id': id,
                    'name': data['name'](),
                    'type': data['viewType']() == '����' ? 'n' : 'col-2'
                };
                LW.Base.sidebar.add(idx, obj, rdtd);

                rdtd.done(function(elem){
                    var mirror,
                        $sections = $('#content div.content-inner > section'),
                        idx,
                        item;

                    // �������ֵ
                    elem.data('id', id);
                    mirror = self.render(elem, data);

                    LW.Base.codeMirrors = LW.Base.codeMirrors.concat(mirror);
                    LW.Base.snippets[id] = self;
                });

                // �ı�isAdd
                LW.isAdd(true);
            });
        },
        /**
         * ��Ⱦ
         * @return {[Array]} codeMirror����,���Ի�����������
         */
        render: function(elem, data){
            var self = this,
                param = {},
                dtd = {},
                codeMirrors = [];

            self.elem = elem;
            self.data = data;

            ko.applyBindings(self.data, elem[0]);
            
            // html
            if( self.data['html']() ){

                codeMirrors[0] = CodeMirror.fromTextArea(elem.find('textarea.mode-html')[0], {
                    lineNumbers: true,
                    theme: LW.Base.theme,
                    mode: "xml",
                    lineWrapping: true
                });
                self.htmlMirror = codeMirrors[0];

            }

            // style
            if( self.data['style']() ){

                codeMirrors[1] = CodeMirror.fromTextArea(elem.find('textarea.mode-css')[0], {
                    lineNumbers: true,
                    theme: LW.Base.theme,
                    mode: "css",
                    lineWrapping: true
                });
                self.styleMirror = codeMirrors[1];

            }

            // script
            

            // content
            

            self.elem.css('height', 'auto');

            $.use('ui-tabs',function(){
                elem.tabs({
                    isAutoPlay: false,
                    event: 'click',
                    titleSelector: 'ul.tab-trigger li.f-tab-t',
                    boxSelector: '.f-tab-b',
                    show: function(e, data){

                        var _this = $(this),
                            $tabB = _this.find('div.f-tab-b').eq(data.index),
                            snippet = LW.Base.snippets[_this.data('id')],
                            mode = $tabB.data('mode');

                        // ���codeMirror isHidden��textarea��ֵ���£�codeMirror���ǲ��ܸ��£��������ﵱcodeMirror showʱ�ֶ�������ֵ
                        if( snippet ){

                            switch(mode){
                                case 'html':
                                    snippet.htmlMirror.setValue(snippet.data['html']());
                                    break;
                                case 'css':
                                    snippet.styleMirror.setValue(snippet.data['style']());
                                    break;
                                // script
                                // content
                            }

                        }

                    }
                });
            });

            return codeMirrors;
        }
    };

    Snippet.prototype.init.prototype = Snippet.prototype;

    LW.Snippet = Snippet;
})(jQuery, window, document, lightWeb);