/*
 * @Author      changbin.wangcb
 * @Date        2013.04.22
 * @Description content
 */
(function ($, win, doc) {
    var content = {
    		init: function(){
    			for(var i in this.Parts){
	                this.Parts[i].init();
	            }
    		}
    	},
        win = $(win),
        doc = $(doc);

    var Parts = (content.Parts = {});

    Parts.onLoad = {
        init: function(){
            var hash = location.hash;

            if( hash.length ){
                $.use("ui-scrollto",function(){
                    win.scrollTo(Math.max(win.scrollTop() - 63, 0));
                });
            }

            win.on('hashchange', function(){
                var hash = location.hash;

                if( hash.length ){
                    $.use("ui-scrollto",function(){
                        win.scrollTo(Math.max(win.scrollTop() - 63, 0));
                    });
                }
            });
        }
    };

    /* nav */
    Parts.nav = {
    	init: function(){
    		var dropdowns = $('#header nav li.dropdown');

    		$('#header nav').on('click.nav-dropdown', 'li.dropdown>a', function(e){
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
    	}
    };

    /* sidebar */
    Parts.sidebar = {
    	init: function(){
    		this.sidebar = $('#sidebar');
            this.container = this.sidebar.find('div.sidebar-inner');
            this.navs = [];
            this.map = {};
    		this.render();
            this.bind();
            this.setHeight();
    	},
        // 渲染右侧导航
    	render: function(){
    		var self = this,
    			container = self.container.find('>ul');

            if( !$('#content div.content-inner>section').length ){
                self.sidebar.hide();
                return;
            }
    		$('#content div.content-inner>section').each(function(i, el){
    			var _this = $(el),
    				parent = _this.find('>header'),
    				childs = _this.find('>article'),
    				$parent = $('<li>', {
                        'class': 'nav-parent'
                    }),
    				$h2 = $('<h2>'),
    				child,
    				$ul, $li , $a, i, l;

    			$a = $('<a>').attr('href', '#' + _this.attr('id')).text(parent.find('>h2').text()).appendTo($h2);
    			$parent.append($h2);
                self.navs.push( '#' + _this.attr('id') );

    			if( childs.length ){
    				$ul = $('<ul>', {
    					'class': 'unstyled'
    				});

    				for( i = 0, l = childs.length; i < l; i++ ){
    					child = childs.eq(i);

                        if( !child.attr('id') ){
                            continue;
                        }

    					$li = $('<li>', {
                            'class': 'nav-child'
                        });
    					$a = $('<a>').attr('href', '#' + child.attr('id')).text(child.find('>h3').text()).appendTo($li);
    					$ul.append($li);
                        self.navs.push( '#' + child.attr('id') );
    				}

    				$parent.append($ul);
    			}

    			container.append($parent);
    		});
    	},
        // 定位事件
        bind: function(){
            var self = this,
                container = self.container,
                hash = location.hash,
                currentScrollTop = doc.scrollTop(),     // 保存文档当前的scrollTop，待会滚动的时候用来判断方向
                navLength = self.navs.length - 1,
                currentAnchor = null,
                currentNav;

            // 如果有hash，定位到对应的导航,否则定位到第一个导航
            currentAnchor = hash.length ? container.find('a[href=' + hash + ']') : container.find('a:eq(0)');
            currentAnchor.addClass('current');
            currentAnchor.closest('li.nav-parent').addClass('current');
            currentNav = $(currentAnchor.attr('href'));

            container.on('click', 'a', function(e){
                var _this = $(this);

                container.find('a').removeClass('current');
                container.find('li.nav-parent').removeClass('current');
                _this.addClass('current');
                _this.closest('li.nav-parent').addClass('current');
                currentAnchor = _this;
                currentNav = $(currentAnchor.attr('href'));

                if( !self.isWrap() ){
                    self.setHeight();
                }
            });

            win.on('scroll', function(){
                var nextNav = null,
                    nav,
                    index,
                    top = doc.scrollTop(),
                    r;

                r = top > currentScrollTop ? 1 : -1;    // 判断方向
                currentScrollTop = top;

                index = currentAnchor ? self.navs.indexOf(currentAnchor.attr('href')) : -1;

                nav = self.navs[[0, index + r, navLength].sort(function(a, b){
                    return a - b
                })[1]];
                nextNav = $(nav);

                if( r === 1 && nextNav.offset().top < doc.scrollTop() + 64 ){
                    nav = container.find('a[href=' + nav + ']');
                    container.find('a').removeClass('current');
                    container.find('li.nav-parent').removeClass('current');
                    nav.addClass('current');
                    currentAnchor = nav;
                    currentAnchor.closest('li.nav-parent').addClass('current');
                    currentNav = $(currentAnchor.attr('href'));
                }else if( r === -1 && currentNav.offset().top > doc.scrollTop() + 64 ){
                    nav = container.find('a[href=' + nav + ']');
                    container.find('a').removeClass('current');
                    container.find('li.nav-parent').removeClass('current');
                    nav.addClass('current');
                    currentAnchor = nav;
                    currentAnchor.closest('li.nav-parent').addClass('current');
                    currentNav = $(currentAnchor.attr('href'));
                }

                if( !self.isWrap() ){
                    self.setHeight();
                }
            }).on('resize', function(){
                self.setHeight();
            });
        },
        // 自适应高度
        setHeight: function(){
            var self = this,
                container = self.container,
                navParents = container.find('> ul > li'),
                navChilds,
                len = navParents.length,
                cLen,
                nav,
                navShow = null,
                viewH = win.height() - 56,
                height,
                index = 0,
                add = 1,
                r = 1;

            if( self.isWrap() ){
                navParents.find('>ul').show();
                return;
            }

            currentNav = container.find('> ul > li.current');
            height = len * 33;

            // 先判断是否只能容纳一级菜单
            if( height + 25 > viewH ){
                navParents.find('>ul').hide();
                return;
            }

            // 判断当前菜单是否展开，再循环前后的菜单是否展开
            nav = navParents.filter('.current');
            index = navParents.index(nav);
            navChilds = nav.find('> ul > li');
            cLen = navChilds.length;
            height = height + cLen * 25;

            while( height < viewH ){
                navShow ? navShow = navShow.add(nav) : navShow = nav;

                index = index + add * r;
                r = -1 * r;
                add += 1;

                if( index < 0 || index > len ){
                    continue;
                } 

                nav = navParents.eq(index);
                navChilds = nav.find('> ul > li');
                cLen = navChilds.length;
                height = height + cLen * 25;
            }

            // todo: 加上一些判断，只有当current值改变的时候，才考虑
            navParents.find('>ul').hide();
            navShow.find('>ul').show();
        },
        isWrap: function(){
            var self = this,
                navParents = self.container.find('> ul > li'),
                navChilds = navParents.find('> ul > li'),
                pLen = navParents.length,
                cLen = navChilds.length,
                viewH = win.height() - 56;

            return pLen * 33 + cLen * 25 < viewH;
        }
    };

    /* tab */
    Parts.tabs = {
        init: function(){
            $.use('ui-tabs',function(){
                $('#content div.content-inner article div.block-main').tabs({
                    isAutoPlay: false,
                    event: 'click',
                    titleSelector: 'ul.tab-trigger li.f-tab-t',
                    boxSelector: '.f-tab-b'
                });
            });
        }
    };

    Parts.codeMirror = {
        init: function(){
            var editors = [];

            $('#content .code-mirror').each(function(i, el){
                var _this = $(el),
                    tabBodys = _this.find('div.block-main .f-tab-b'),
                    tabBody,
                    introBlock = _this.find('div.block-intro'),
                    editor, i, l;
                
                for( i = 0, l = tabBodys.length; i < l; i++){
                    tabBody = tabBodys.eq(i);
                    switch( tabBody.data('mode') ){
                        case 'html':
                            editor = CodeMirror(tabBody[0], {
                                value: introBlock.find('div.html-demo').html(),
                                lineNumbers: true,
                                theme: 'rubyblue'
                            });
                            break;
                        case 'css':
                            editor = CodeMirror(tabBody[0], {
                                value: introBlock.find('style:eq(0)').html(),
                                lineNumbers: true,
                                theme: 'rubyblue'
                            });
                            break;
                        case 'javascript':
                            editor = CodeMirror(tabBody[0], {
                                value: introBlock.find('javascript:eq(0)').html(),
                                lineNumbers: true,
                                theme: 'rubyblue'
                            });
                            break;
                        default:
                            break;
                    }
                    editors.push(editor);
                }
            });

            $('#header nav li.theme').on('click', 'ul.dropdown-menu a', function(e){
                var _this = $(this),
                    i, l;

                e.preventDefault();

                for( i = 0, l = editors.length; i < l; i++ ){
                    editors[i].setOption('theme', _this.text());
                }
            })
        }
    };

    $(function() {
        content.init();
    });
})(jQuery, window, document);