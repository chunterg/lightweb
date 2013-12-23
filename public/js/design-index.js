/*
 * @Author      changbin.wangcb
 * @Date        2013.08.08
 * @Description design
 */

(function($, Design){
    var editM = null;

    $(function(){
        var isNew = false;

        // 新手引导
        $.use("util-storage",function(){
            var STORE = jQuery.util.storage;

            STORE.ready(function(){
                var designGuide = STORE.getItem('designGuide'),
                    $guide = $('#guide'),
                    guideM = null,
                    isCopy = false,
                    title;

                // ie6下 没有的本地存储是字符串‘null’
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
                                    var styleObj = 'clipboard{text:拷贝代码;color:#ffffff;fontSize:13;font-weight:bold;font: 12px/1.5 Tahoma,Arial,"宋体b8b\4f53",sans-serif;}';
                                    
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

            // 关闭、新建
            $('button.close', $createType).on('click', function(){
                Design.add();

                $createType.dialog('close');
            });

            $('button.btn-new', $createType).on('click', function(){
                Design.add();

                $createType.dialog('close');
            });

            // 修改
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

            // 修改确认
            $('div.modal-footer .btn', $createType).on('click', function(e){
                e.preventDefault();

                if( editM.getValue().trim() !== '' ){
                    var vmObj;

                    if( !Design.edit(editM.getValue()) ){
                        return;
                    }

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
                    alert('请先输入题图动画数据模型！');
                }
            });
        });
    });
})(jQuery, FE.tools.design);