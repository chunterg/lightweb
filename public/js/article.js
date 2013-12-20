/*
 * @Author      changbin.wangcb
 * @Date        2013.10.09
 * @Description �ĵ���Ⱦ
 */

define(['jquery', 'knockout', 'request', 'mapping'], function($, ko, request, mapping){
    "use strict";

    function article(options){
        return new article.prototype.init(options);
    }

    article.prototype = {
        constructor: article,
        init: function(options){
            this.options = options;
        },
        // �༭
        edit: function(dtd, data, callback){
            var self  = this,
                param = {
                    _ajax  : true,
                    action : 'edit'
                };

            $.extend(true, param, data);

            // ajax
            request('/snippet/do', param, dtd, 'json' ,'post');

            // ����ɹ��󣬸���codeMirror���ֵ
            $.when(dtd).done(function(result){  

                self.data = mapping.fromJS(data);
                callback();

            });
        },
        // ����
        add: function(dtd, data, callback){
            var self  = this,
                param = {
                    _ajax  : true,
                    action : 'add'
                };

            $.extend(true, param, data);

            /*param = {
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
            };*/

            request('/snippet/do', param, dtd, 'json' ,'post');

            $.when(dtd).done(function(result){

                callback(result);

            });
        },
        /**
         * ��Ⱦ
         * @return {[Array]} codeMirror����,���Ի�����������
         */
        render: function(elem, data){
            var self        = this,
                codeMirrors = [],
                $txts;

            self.elem = elem;
            self.data = data;
            self.mirrors = {};

            ko.applyBindings(self.data, elem[0]);
            $txts = elem.find('textarea[data-key]');
            
            $txts.each(function(idx, ele){
                var _this  = $(ele),
                    key    = _this.data('key'),
                    oldKey = key,
                    keys   = [],
                    obj    = data;

                    if( key.indexOf('.') > -1 ){
                        keys = key.split('.');

                        for( var i = 0, l = keys.length - 1; i < l; i++ ){
                            obj = obj[keys[i]];
                        }

                        key = keys[l];
                    }

                    codeMirrors[idx] = CodeMirror.fromTextArea(_this[0], {
                        lineNumbers  : true,
                        theme        : Base.theme,
                        mode         : _this.data('mode'),
                        lineWrapping : true
                    });

                    self.mirrors[oldKey] = codeMirrors[idx];
            });

            elem.css('height', 'auto');

            // TODO: Ǩ�Ƴ�ȥ����Ϊcallback or ������ʽ����
            $.use('ui-tabs', function(){
                elem.tabs({
                    isAutoPlay: false,
                    event: 'click',
                    titleSelector: 'ul.tab-trigger li.f-tab-t',
                    boxSelector: '.f-tab-b',
                    show: function(e, data){

                        var _this = $(this),
                            $tabB = _this.find('div.f-tab-b').eq(data.index),
                            article = Base.articles[_this.data('id')],
                            key = $tabB.data('key'),
                            oldKey = key,
                            keys = [],
                            obj = article.data;

                        // ���codeMirror isHidden��textarea��ֵ���£�codeMirror���ǲ��ܸ��£��������ﵱcodeMirror showʱ�ֶ�������ֵ
                        if( article ){

                            if( key.indexOf('.') > -1 ){
                                keys = key.split('.');

                                for( var i = 0, l = keys.length - 1; i < l; i++ ){
                                    obj = obj[keys[i]];
                                }

                                key = keys[l];
                            }

                            article.mirrors[oldKey] && article.mirrors[oldKey].setValue(obj[key]());

                        }

                    }
                });
            });

            return codeMirrors;
        }
    };

    article.prototype.init.prototype = article.prototype;

    return article;
});