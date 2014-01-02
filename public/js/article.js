/*
 * @Author      changbin.wangcb
 * @Date        2013.10.09
 * @Description 文档渲染
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
        // 编辑
        edit: function(dtd, callback){
            var self  = this,
                data = {},
                param = {
                    _ajax  : true,
                    action : 'edit'
                };

            // $.extend(true, param, data);

            data = mapping.toJS(self.data);
            $.extend(true, param, data);

            // ajax
            request('/snippet/do', param, dtd, 'json' ,'post');

            // 保存成功后，更新codeMirror里的值
            $.when(dtd).done(function(result){  
                var key, mirror;
                
                for( key in self.mirrors ){
                    mirror = self.mirrors[key];
                    mirror.setValue(Base.getProp(self.data, key)());
                }

                callback();

            });
        },
        // 新增
        add: function(dtd, data, callback){
            var self  = this,
                param = {
                    _ajax  : true,
                    action : 'add'
                };

            data = mapping.toJS(data);
            $.extend(true, param, data);

            request('/snippet/do', param, dtd, 'json' ,'post');

            $.when(dtd).done(function(result){

                callback(result);

            });
        },
        /**
         * 渲染
         * @return {[Array]} codeMirror数组,可以缓存做换肤用
         */
        render: function(elem, data){
            var self        = this,
                codeMirrors = [],
                $txts;

            self.elem = elem;
            // data.oldName = data.name();
            self.data = data;
            self.mirrors = {};

            ko.applyBindings(self.data, elem[0]);
            $txts = elem.find('textarea[data-key]');
            
            $txts.each(function(idx, ele){
                var _this  = $(ele),
                    key    = _this.data('key');

                    codeMirrors[idx] = CodeMirror.fromTextArea(_this[0], {
                        lineNumbers  : true,
                        theme        : Base.theme,
                        mode         : _this.data('mode'),
                        indentUnit   : 4,
                        lineWrapping : true,
                        readOnly     : true
                    });

                    codeMirrors[idx].on('focus', function(cm, obj){
                        cm.setOption('readOnly', false);
                        cm.setOption('autoCloseTags', true);
                        cm.setOption('autoCloseBrackets', true);
                    });

                    codeMirrors[idx].on('blur', function(cm, obj){
                        cm.setOption('readOnly', true);
                        cm.setOption('autoCloseTags', false);
                        cm.setOption('autoCloseBrackets', false);
                        cm.save();
                        $(cm.getTextArea()).trigger('change');
                    });

                    self.mirrors[key] = codeMirrors[idx];
            });

            elem.css('height', 'auto');

            // TODO: 迁移出去，作为callback or 其他方式引入
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
                            mirror = null;

                        // 如果codeMirror isHidden，textarea的值更新，codeMirror还是不能更新，所以这里当codeMirror show时手动更新其值
                        if( article && key ){

                            mirror = article.mirrors[key];
                            mirror.save();
                            $(mirror.getTextArea()).trigger('change');
                            mirror && mirror.setValue(mirror.getTextArea().value);

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