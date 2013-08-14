/*
 * @Author      changbin.wangcb
 * @Date        2013.08.08
 * @Description design
 */

(function($){
    $(function(){
        var jq = $,
            animateIdx = 1,
            anchorIdx = 1,
            currentTime = 0.1;

        function designModel () {
            this['designBgImg']  = ko.observable('http://img.china.alibaba.com/cms/upload/2013/020/316/1613020_1625054590.jpg');        // ��ͼ����
            this['fixBgImg']     = ko.observable('');        // ie6 fix jpg����
            this['contentBgImg'] = ko.observable('');        // ������ͼ�Ľ��䱳����
            this['contentBg']    = ko.observable('fff');    // ����ɫ
            this['designHeight'] = ko.observable(200);       // ��ͼ�߶�
            this['designStyle']  = ko.computed({
                read: function(){
                    var style = '';

                    style = '#in-design .mod-titu { height: ' + this.designHeight() + 'px; }';

                    if ( this.designBgImg() !== '' ){
                        style += '#in-design { background-color: #' + this.contentBg() + '; background-image: url(' + this.designBgImg() + ');';

                        if( this.fixBgImg() !== '' ){
                            style += ' _background-image: url(' + this.fixBgImg() + ');';
                        }

                        style += ' }'
                    }

                    return style;
                },
                write: function(){

                },
                owner: this
            });
            this['contentStyle'] = ko.computed({
                read: function(){
                    var style = '';

                    style = '.cell-page-main { background-color: #' + this.contentBg() + ';';

                    if( this.contentBgImg() !== '' ){
                        style += ' background-image: url(' + this.contentBgImg() + ')';
                    }

                    style += ' }';

                    return style;
                },
                write: function(){

                },
                owner: this
            });
            this['animates']     = ko.observableArray([  // �����б�
                
            ]);
            this['anchors']      = ko.observableArray([  // ê���б�
            ]);
            this['style']        = ko.computed({
                read: function(){
                    var style = '',
                        animates = this.animates(),
                        anchors = this.anchors();

                    style = this.designStyle() + '\n' + this.contentStyle() + '\n';
                    
                    if( animates.length > 0 ){
                        for( var i = 0, l = animates.length; i < l; i++ ){
                            style += animates[i].style() + '\n';
                        }
                    }

                    if( anchors.length > 0 ){
                        for( var i = 0, l = anchors.length; i < l; i++ ){
                            style += anchors[i].style() + '\n';
                        }
                    }

                    return style;
                },
                write: function(){

                },
                owner: this
            });
        }

        function animateModel (obj) {
            if( typeof obj !== 'undefined' ){
                this['name']             = ko.observable(obj.name);
                this['className']        = ko.observable(obj.className);   // ����img class
                this['img']              = ko.observable(obj.img);        // ����img png24
                this['title']            = ko.observable(obj.title);        // alt
                this['beginTime']        = ko.observable(obj.beginTime);        // ��ʼʱ��
                this['duration']         = ko.observable(obj.duration);        // ����ʱ��
                this['animateType']      = ko.observable(obj.animateType);        // ��������
                this['top']              = ko.observable(obj.top);         // top
                this['left']             = ko.observable(obj.left);         // left
                this['height']           = ko.observable(obj.height);          
                this['width']            = ko.observable(obj.width);
                this['zIndex']           = ko.observable(obj.zIndex);
                this['hasHoverEvent']    = ko.observable(obj.hasHoverEvent);        // �Ƿ���hoverЧ��
                this['hoverAnimateType'] = ko.observable(obj.hoverAnimateType);        // hover��������
            }else{
                this['name']             = ko.observable('����' + animateIdx);
                this['className']        = ko.observable('img img-' + animateIdx);   // ����img class
                this['img']              = ko.observable('');        // ����img png24
                this['title']            = ko.observable('');        // alt
                this['beginTime']        = ko.observable(currentTime);        // ��ʼʱ��
                this['duration']         = ko.observable(1);        // ����ʱ��
                this['animateType']      = ko.observable('');        // ��������
                this['top']              = ko.observable(0);         // top
                this['left']             = ko.observable(0);         // left
                this['height']           = ko.observable(0);          
                this['width']            = ko.observable(0);
                this['zIndex']           = ko.observable(0);
                this['hasHoverEvent']    = ko.observable(false);        // �Ƿ���hoverЧ��
                this['hoverAnimateType'] = ko.observable('');        // hover��������
            }
            
            this['style']            = ko.computed({
                read: function(){
                    var style = '';

                    style = '#in-design .mod-titu .' + this.className().slice(4) + ' { top: ' + this.top() + 'px; left: ' + this.left() + 'px; ';

                    if( this.zIndex() !== 0 ){
                        style = style + 'z-index: ' + this.zIndex() +';';
                    }

                    if( this.duration() !== 1 ){
                        style = style + '-webkit-animation-duration: ' + this.duration() + 's;'
                              + '-moz-animation-duration: ' + this.duration() + 's;'
                              + '-o-animation-duration: ' + this.duration() + 's;'
                              + 'animation-duration: ' + this.duration() + 's;';
                    }

                    style = style + '}';

                    return style;
                },
                owner: this
            });
            this.animateFn           = ko.computed({
                read: function(){
                    if( this.animateType() !== '' ){
                        var className = this.className().slice(4),
                            fnStr = '',
                            _this = $('#in-design div.mod-titu img.' + className);

                        _this.removeClass().addClass('img ' + className);

                        fnStr = "var _this = jQuery('#in-design div.mod-titu img." + className + "');";
                        fnStr = fnStr + "_this.css('opacity', 0);";
                        fnStr = fnStr + "setTimeout(function(){ _this.css({ 'opacity': 1 }).addClass('animated " + this.animateType() + "');";
                        fnStr = fnStr + "}, " + this.beginTime() * 1000 + ");";

                        // hover����
                        if( this.hasHoverEvent() && this.hoverAnimateType() !== '' ){
                            fnStr = fnStr + "setTimeout(function(){ _this.removeClass('animated " + this.animateType() + "');"
                                  + "jQuery('#in-design').mouseenter(function(){ _this.addClass('animated " + this.hoverAnimateType() + "'); });"
                                  + "jQuery('#in-design').mouseleave(function(){ _this.removeClass('animated " + this.hoverAnimateType() + "'); });"
                                  + "}, 6000);"; 
                        }

                        inDesign[className] = new Function(fnStr);

                        inDesign[className]();
                    }
                },
                write: function(){

                },
                owner: this
            });
        }

        function anchorModel (obj) {
            if( typeof obj !== 'undefined' ){
                this['className'] = ko.observable(obj.className);
                this['title']     = ko.observable(obj.title);
                this['height']    = ko.observable(obj.height);
                this['width']     = ko.observable(obj.width);
                this['href']      = ko.observable(obj.href);
                this['top']       = ko.observable(obj.top);         // top
                this['left']      = ko.observable(obj.left);         // left
            }else{
                this['className'] = ko.observable('anchor anchor-' + anchorIdx);
                this['title']     = ko.observable('');
                this['height']    = ko.observable(100);
                this['width']     = ko.observable(100);
                this['href']      = ko.observable('#');
                this['top']       = ko.observable(0);         // top
                this['left']      = ko.observable(0);         // left
            }
            
            this['style']     = ko.computed({
                read: function(){
                    var style = '';

                    style = '#in-design .mod-titu .' + this.className().slice(7) + ' { top: ' + this.top() + 'px; left: ' + this.left() + 'px;' 
                          + 'height: ' + this.height() + 'px; width: ' + this.width() + 'px; }';

                    return style;
                },
                write: function(){

                },
                owner: this
            });
        }

        var inDesign = {
            init: function () {
                var isIE6 = jq.util.ua.ie6;

                if( isIE6 ){
                    return;
                }

                for(var i in this){
                    var supportTrans = Modernizr.csstransitions;

                    if( supportTrans ){
                        if( i !== 'init' ){
                            this[i]();
                        }
                    }else{
                        jq('img.img').fadeIn();
                    }
                }
            }
        };

        function objectToString( obj ) {
            var str = '';

            function nativeToString( value ) {
                var result = {};

                for( var i in value ){
                    if( value.hasOwnProperty(i) ){
                        if( value[i] !== null ){
                            result[i] = value[i].toString().replace(/[\n\r]/g, '');
                        }
                    }
                }

                result = JSON.stringify(result, null, 4);

                return result;
            }

            str = nativeToString(obj);

            return str;
        }

        function bindEvent(){
            var $sidebar = $('#sidebar'),
                $animateList = $('li.animate-list > ul', $sidebar),
                $anchorList = $('li.anchor-list > ul', $sidebar)
                $animateSet = $('#animate-set'),
                $titu = $('#in-design div.mod-titu');

            // ���Ӷ����ز�
            $('button.add-anim-item', $sidebar).on('click', function(){
                var am = new animateModel();
                vm.animates.push(am);

                $.use("ui-draggable, ui-droppable",function(){
                    $('img.' + am.className().slice(4), $titu).draggable({
                        cursor: 'move',
                        stop: function(){
                            var _this = $(this),
                                idx = $('img', $titu).index(_this);

                            vm.animates()[idx].left(parseInt(_this.css('left')));
                            vm.animates()[idx].top(parseInt(_this.css('top')));
                        }
                    });
                });
                
                animateIdx++;
                currentTime += 1;
            });

            // ����ê��
            $('button.add-anchor-item', $sidebar).on('click', function(){
                var am = new anchorModel();
                vm.anchors.push(am);

                $.use("ui-draggable, ui-droppable",function(){
                    $('a.' + am.className().slice(7), $titu).draggable({
                        cursor: 'move',
                        stop: function(){
                            var _this = $(this),
                                idx = $('a', $titu).index(_this);

                            vm.anchors()[idx].left(parseInt(_this.css('left')));
                            vm.anchors()[idx].top(parseInt(_this.css('top')));
                        }
                    });
                });

                anchorIdx++;
            });
            
            // ɾ�������ز�
            $animateList.on('click', 'dd.del i', function(){
                var _this = $(this),
                    className = _this.data('name');

                vm.animates.remove(function(item) {
                    return item.className() === className;
                });

                delete inDesign[className.slice(4)];
            });

            // ɾ��ê��
            $anchorList.on('click', 'dd.del i', function(){
                var _this = $(this),
                    className = _this.data('name');

                vm.anchors.remove(function(item) {
                    return item.className() === className;
                });
            });

            // �����زĶ���
            $animateList.on('click', 'button', function(){
                var _this = $(this),
                    $items = $animateList.find('li button'),
                    idx = $items.index(_this);

                if( _this.closest('li').find('input').val().trim() === '' ){
                    alert('�����ϴ�ͼƬ�������ö���Ч����');

                    return;
                }

                ko.applyBindings(vm.animates()[idx], $animateSet[0]);
                $animateSet.css('top', parseInt(_this.offset().top) - 381).show().data('className', vm.animates()[idx].className().slice(4));
            });

            // �ر��زĶ���
            $('i.icon-remove', $animateSet).on('click', function(){
                $animateSet.hide();
            });

            // ȷ�϶���
            $('button.btn-sure', $animateSet).on('click', function(){
                $animateSet.hide();
            });

            // Ԥ�������ز�
            $('button.preview', $animateSet).on('click', function(){
                var className = $animateSet.data('className'),
                    _this = $('img.' + className, $titu);

                _this.removeClass().addClass('img '+ className);
                inDesign[className] && inDesign[className]();
            });

            // Ԥ����ͼ����
            $('#content-wrap div.mod-action button').on('click', function(){
                var style = '',
                    html = '',
                    js = '',
                    code = '',
                    model = '';

                $('img.img', $titu).each(function(idx, el){
                    var _this = $(el),
                        className = _this.attr('class');

                    className = className.replace(/(img img-(\d)+).*/g, '$1');
                    _this.removeClass().addClass(className);
                });

                // ������ͼ����
                style = $('.const-style').html() + $('.var-style').html();
                style = cssbeautify(style, {
                    indent        : '    ',
                    autosemicolon : true
                });
                style = '<style type="text/css">' + '\n' + style + '</style>';
                style = '<link rel="stylesheet" type="text/css" href="http://static.c.aliimg.com/css/app/operation/module/third/animate.css" />' + '\n' + style;

                html = $('#in-design').html();
                // ȥ��knouckout�İ����
                html = html.replace(/data-bind=\".*?\"/gi, '');
                html = html.replace(/<!-- \/?ko.*-->/gi, '');
                html = html.replace(/<img(.*?)>/gi, '<img$1/>');
                html = html.replace(/style=\".*?\"/gi, '');
                html = '<div id="in-design">' + html + '</div>';  

                if( vm.animates().length > 0 ){
                    js = objectToString(inDesign);
                    js = '(function(jq){ var inDesign = ' + js + '; jq(function(){ inDesign.init(); }); })(jQuery);';
                    js = js_beautify(js.replace(/\"(function(.*)\(\)\s*{.*})\"/g, '$1'));
                    js = '<script type="text/javascript" src="http://static.c.aliimg.com/js/app/operation/module/third/modernizr.min.js"></script>'
                       + '<script type="text/javascript">' + '\n'
                       + 'if( typeof jQuery === "undefined" ){ alert("��ͼ����������jQuery������ϵǰ�˽�fdev-min.js����header�"); }' + '\n'
                       + js + '\n' + '</script>';
                }

                code = style + '\n' + html + '\n' + js;
                $('#content-wrap div.mod-code textarea').val(code);

                codeM.setValue(code);

                // ��������ģ��
                var vmObj = ko.mapping.toJS(vm),
                    temp = '',
                    anchorTemp = '';

                // ��style������Ϊnull����Ϊ����ģ���ﲻ��Ҫ��Щ��������Ϊnull������toString��ʱ����˵�
                vmObj['contentStyle'] = null;
                vmObj['designStyle'] = null;
                vmObj['style'] = null;
                temp = '[';
                anchorTemp = '[';

                for( var i = 0, l = vmObj['animates'].length; i < l; i++ ){
                    delete vmObj['animates'][i]['style'];
                    temp = temp + (i > 0 ? ',' : '') + JSON.stringify(vmObj['animates'][i], null, 4);
                }

                temp += ']';

                for( var i = 0, l = vmObj['anchors'].length; i < l; i++ ){
                    delete vmObj['anchors'][i]['style'];
                    anchorTemp = anchorTemp + (i > 0 ? ',' : '') + JSON.stringify(vmObj['anchors'][i], null, 4);
                }

                anchorTemp += ']';

                model = objectToString(vmObj);
                model = model.replace(/\"animates\": \"(\[object Object\](,)?)*\"/gi, '"animates": ' + temp);
                model = model.replace(/\"anchors\": \"(\[object Object\](,)?)*\"/gi, '"anchors": ' + anchorTemp);
                model = js_beautify(model);
                $('#content-wrap div.mod-model textarea').val(model);

                modelM.setValue(model);

                inDesign.init();    // Ԥ����ͼ����Ч��
            });

            // չ������
            $('#content-wrap div.cell-header h3').on('click', function(){
                var _this = $(this).find(' > i'),
                    $content = _this.closest('div.cell-header').next('div.cell-content');

                if( $content.is(':hidden') ){
                    _this.removeClass('icon-chevron-down').addClass('icon-chevron-up');
                    $content.slideDown(function(){
                        if( $content.parent('div').hasClass('mod-code') ){
                            codeM.setValue($('#content-wrap div.mod-code textarea').val());
                        }else {
                            modelM.setValue($('#content-wrap div.mod-model textarea').val());
                        }
                    });
                }else{
                    _this.removeClass('icon-chevron-up').addClass('icon-chevron-down');
                    $content.slideUp();
                }
            });

            // ���Ƶ�������
            $('#content-wrap div.cell-header').each(function(idx, el){
                var _this = $(el).parent('div');

                $.use('ui-flash-clipboard', function() {
                    var styleObj = 'clipboard{text:��������;color:#ffffff;fontSize:13;font-weight:bold;font: 12px/1.5 Tahoma,Arial,"����b8b\4f53",sans-serif;}';
                    
                    _this.find('div.fd-right').flash({
                        module : 'clipboard',
                        width : 88,
                        height : 35,
                        flashvars : {
                            style : encodeURIComponent(styleObj)
                        }
                    }).on("swfReady.flash", function() {
                        //debugStr("#debug_1", "swfReady");
                    }).on("mouseDown.flash", function() {
                        $('#content-wrap div.mod-action button').trigger('click');

                        if( _this.hasClass('mod-code') ){
                            $(this).flash("setText", codeM.getValue());
                        }else{
                            $(this).flash("setText", modelM.getValue());
                        }
                        
                    }).on("complete.flash", function(e, data) {
                        //debugStr("#debug_1", "copy text:" + data.text);
                    });
                });
            });

            // codeMirror
            var codeM = CodeMirror.fromTextArea($('#content-wrap div.mod-code textarea')[0], {
                lineNumbers: true,
                mode: "xml",
                theme: 'rubyblue'
            });

            var modelM = CodeMirror.fromTextArea($('#content-wrap div.mod-model textarea')[0], {
                lineNumbers: true,
                mode: "javascript",
                theme: 'rubyblue'
            });

            // �����ز���ק
            $.use("ui-draggable, ui-droppable", function(){
                $('img', $titu).draggable({
                   ��cursor: 'move'
                });

                $('a.anchor', $titu).draggable({
                    cursor: 'move'
                });
            });

            // �����ز�focus
            $titu.on('click', 'img', function(){
                $titu.find('img, a').removeClass('selected');
                $(this).addClass('selected');
                $(document).on('keydown.inDesign', keydownIndesign);
            }).on('click', 'a.anchor', function(e){
                e.preventDefault();

                $titu.find('img, a').removeClass('selected');
                $(this).addClass('selected');
                $(document).on('keydown.inDesign', keydownIndesign);
            });

            $(document).on('click', function(e){
                var _this = $(e.target);

                if( !_this.hasClass('img') && !_this.hasClass('anchor') ){
                    $(document).off('keydown.inDesign');
                    $titu.find('img, a').removeClass('selected');
                }
            });

            $(document).on('keydown.inDesign', keydownIndesign);

            $(document).off('keydown.inDesign');

            // ����ͼƬ�޸��Զ�����
            $('#design-bg').on('change', function(){
                var _this = $('img.img-hid');

                _this.on('load', function(){
                    vm.designHeight(_this.height());
                });
                
            });

            // չ�����ද��
            $($animateSet).on('click', 'p.handler', function(){
                var _this = $(this),
                    $more = _this.next('div');

                if( $more.is(':hidden') ){
                    $more.slideDown();
                    _this.find('i').removeClass('icon-chevron-down').addClass('icon-chevron-up');
                }else{
                    $more.slideUp();
                    _this.find('i').removeClass('icon-chevron-up').addClass('icon-chevron-down');
                }
            });

            function keydownIndesign(e){
                var _this = $('#in-design .selected'),
                    idx = 0,
                    left,
                    top;

                e.preventDefault();

                if( _this.length > 0 ){
                    if( _this[0].tagName.toLowerCase() === 'img' ){
                        idx = $('img', $titu).index(_this);

                        left = vm.animates()[idx].left();
                        top = vm.animates()[idx].top();

                        switch(e.keyCode){
                            case $.ui.keyCode.LEFT:
                                vm.animates()[idx].left(left - 1);
                                break;
                            case $.ui.keyCode.UP:
                                vm.animates()[idx].top(top - 1);
                                break;
                            case $.ui.keyCode.RIGHT:
                                vm.animates()[idx].left(left + 1);
                                break;
                            case $.ui.keyCode.DOWN:
                                vm.animates()[idx].top(top + 1);
                                break;
                            // ����Ҫdefault
                        }
                    }else{
                        idx = $('a.anchor', $titu).index(_this);

                        left = vm.anchors()[idx].left();
                        top = vm.anchors()[idx].top();

                        switch(e.keyCode){
                            case $.ui.keyCode.LEFT:
                                vm.anchors()[idx].left(left - 1);
                                break;
                            case $.ui.keyCode.UP:
                                vm.anchors()[idx].top(top - 1);
                                break;
                            case $.ui.keyCode.RIGHT:
                                vm.anchors()[idx].left(left + 1);
                                break;
                            case $.ui.keyCode.DOWN:
                                vm.anchors()[idx].top(top + 1);
                                break;
                            // ����Ҫdefault
                        }
                    }
                }
            }
        }

        var vm = new designModel();

        var editM = null;

        $(function(){
            var isNew = false;

            // ��������
            $.use("util-storage",function(){
                var STORE = jQuery.util.storage;

                STORE.ready(function(){
                    var designGuide = STORE.getItem('designGuide'),
                        $guide = $('#guide'),
                        guideM = null,
                        isCopy = false,
                        title;

                    // ie6�� û�еı��ش洢���ַ�����null��
                    if( (typeof designGuide === 'string' && designGuide === 'true') ){
                        
                    }else{
                        $.use('ui-dialog', function(){
                            $guide.dialog({
                                fixed: true,
                                center: true,
                                open: function(){
                                    guideM = CodeMirror.fromTextArea($('textarea', $guide)[0], {
                                        lineNumbers: true,
                                        mode: "javascript",
                                        theme: 'rubyblue'
                                    });

                                    $.use('ui-flash-clipboard', function() {
                                        var styleObj = 'clipboard{text:��������;color:#ffffff;fontSize:13;font-weight:bold;font: 12px/1.5 Tahoma,Arial,"����b8b\4f53",sans-serif;}';
                                        
                                        $guide.find('div.modal-footer div.btn-primary').flash({
                                            module : 'clipboard',
                                            width : 80,
                                            height : 30,
                                            flashvars : {
                                                style : encodeURIComponent(styleObj)
                                            }
                                        }).on("swfReady.flash", function() {
                                            //debugStr("#debug_1", "swfReady");
                                        }).on("mouseDown.flash", function() {
                                            $(this).flash("setText", guideM.getValue());
                                        }).on("complete.flash", function(e, data) {
                                            isNew = true;
                                            $('#create-type button.btn-new').attr('disabled', true);
                                            $guide.dialog('close');
                                        });
                                    });
                                }
                            });
                        });

                        $('a.btn-know', $guide).on('click', function(e){
                            e.preventDefault();

                            STORE.setItem('designGuide', true);
                            $guide.dialog('close');
                        });
                    }
                });
            });

            $.use('ui-dialog', function(){
                var $createType = $('#create-type');

                $createType.dialog({
                    fixed: true,
                    center: true
                });

                // �رա��½�
                $('button.close', $createType).on('click', function(){
                    ko.applyBindings(vm, $('#doc')[0]);
                    bindEvent();

                    $createType.dialog('close');
                });

                $('button.btn-new', $createType).on('click', function(){
                    ko.applyBindings(vm, $('#doc')[0]);
                    bindEvent();

                    $createType.dialog('close');
                });

                // �޸�
                $('button.btn-edit', $createType).on('click', function(){
                    if( editM !== null ){
                        return;
                    }

                    $('div.modal-footer, div.edit-wrap', $createType).show();

                    editM = CodeMirror.fromTextArea($('textarea', $createType)[0], {
                        lineNumbers: true,
                        mode: "javascript",
                        theme: 'rubyblue'
                    });
                });

                // ȷ��
                $('div.modal-footer .btn', $createType).on('click', function(e){
                    e.preventDefault();

                    var $text = $('textarea', $createType);

                    if( editM.getValue().trim() !== '' ){
                        var vmObj;
                        try{
                            vmObj = JSON.parse(editM.getValue());
                        }catch(ex){
                            alert('��������ȷ����ģ��!');
                            return;
                        }
                        
                        
                        for( var i in vmObj ){
                            if( !(vmObj[i] instanceof Array) ){
                                vm[i](vmObj[i]);
                            }else{
                                for( var j = 0, l = vmObj[i].length; j < l; j++ ){
                                    if( i === 'animates' ){
                                        vm.animates.push(new animateModel(vmObj[i][j]));
                                    }else{
                                        vm.anchors.push(new anchorModel(vmObj[i][j]));
                                    }
                                }
                            }
                        }

                        var amL = vmObj['animates'].length,
                            anL = vmObj['anchors'].length;

                        if( amL > 0 ){
                            animateIdx = parseInt(vmObj['animates'][amL - 1].className.slice(8)) + 1;
                        }

                        if( anL > 0 ){
                            anchorIdx = parseInt(vmObj['anchors'][anL - 1].className.slice(14)) + 1;
                        }

                        ko.applyBindings(vm, $('#doc')[0]);
                        bindEvent();

                        $createType.dialog('close');
                        
                        if( isNew ){
                            $.use("util-storage",function(){
                                var STORE = jQuery.util.storage;
                                STORE.ready(function(){
                                    guide = FE.wholesale.belt.module.Guide({
                                        'options': {
                                            'closeIsNext' : true,
                                            'index'       : STORE.getItem('designGuide') || 0
                                        }, 
                                        'list': [
                                            {
                                                'elem'      : $('#sidebar li.bg-list > h3'),
                                                'className' : 'guide-diy-step1',
                                                'offset'    : {
                                                    'left' : -31,
                                                    'top'  : 32
                                                },
                                                'position': 'lb'
                                            },
                                            {
                                                'elem'      : $('#sidebar li.animate-list button:eq(0)'),
                                                'className' : 'guide-diy-step2',
                                                'offset'    : {
                                                    'left' : -53,
                                                    'top'  : 49
                                                },
                                                'position': 'lb'
                                            },
                                            {
                                                'elem'      : $('#in-design div.mod-titu img.img-1'),
                                                'className' : 'guide-diy-step3',
                                                'offset'    : {
                                                    'left' : -53,
                                                    'top'  : -7
                                                },
                                                'position': 'lb'
                                            },
                                            {
                                                'elem'      : $('#content-wrap > div.mod-action .preview'),
                                                'className' : 'guide-diy-step4',
                                                'offset'    : {
                                                    'left' : -46,
                                                    'top'  : 48
                                                },
                                                'position': 'lb'
                                            },
                                            {
                                                'elem'      : $('#content-wrap div.mod-code div.cell-header div.btn'),
                                                'className' : 'guide-diy-step5',
                                                'offset'    : {
                                                    'left' : 59,
                                                    'top'  : -53
                                                },
                                                'position': 'rt'
                                            },
                                            {
                                                'elem'      : $('#content-wrap div.mod-model div.cell-header div.btn'),
                                                'className' : 'guide-diy-step6',
                                                'offset'    : {
                                                    'left' : 59,
                                                    'top'  : -53
                                                },
                                                'position': 'rt'
                                            }], 
                                        'complete': function(){
                                            STORE.setItem('designGuide', 'true');
                                        },
                                        'step': function(){
                                            
                                        }
                                    });
                                });
                            });
                        }
                    }else{
                        alert('����������ͼ��������ģ�ͣ�');
                    }
                });
            });
        });
    });
})(jQuery);