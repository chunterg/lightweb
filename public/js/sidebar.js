/*
 * @Author      changbin.wangcb
 * @Date        2013.07.09
 * @Description sidebar-侧边栏
 */

define(['jquery'], function($){
    "use strict";
    var win = $(window),
        doc = $(document);

    function sidebar(elem){
        return new sidebar.prototype.init(elem);
    } 

    sidebar.prototype = {
        constructor: sidebar,
        init: function(elem){
            this.container = $(elem);
            this.navs = [];
            this.map = {};
            this.render();
            this.bindEvent();
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
        /**
         * 新增导航节点，渲染article
         * @param  {Number}         idx  section index
         * @param  {Object}         data 节点信息
         * @param  {Deferred}       dtd  
         * @return {jQuery Element}      新增的article节点
         */
        add: function(idx, data, dtd){
            var self = this,
                $parent = this.container.find('> ul').eq(idx),
                $section = $('#content div.content-inner > section').eq(idx),
                $li,
                $article,
                idx, pArr = [], nArr = [];

            // 新增导航节点
            $li = $('<li class="nav-child">');
            $('<a>').attr('href', '#a-' + data.id).attr('data-id', data.id).attr('data-type', data.type).text(data.name).appendTo($li);
            $li.appendTo($parent.find('ul'));

            // 新增article
            $article = $( _template( tmpl, {
                'id': data.id,
                'name': data.name,
                'type': data.type
            } ) ).insertBefore( $section.find('> footer') );

            // 往navs数组中添加新节点
            idx = self.navs.indexOf($li.prev('li').find('a').attr('href'));
            pArr = self.navs.slice(0, idx + 1);
            nArr = self.navs.slice(idx + 1, self.navs.length);
            pArr.push('#a-' + data.id);
            self.navs = pArr.concat(nArr);
            
            self.setHeight();
            dtd.resolve($article);
        },
        // 定位事件
        bindEvent: function(){
            var self = this,
                container = self.container,
                hash = location.hash,                   // hash
                currentScrollTop = doc.scrollTop(),     // 保存文档当前的scrollTop，待会滚动的时候用来判断方向
                navLength,
                currentAnchor = null,                   // 当前的锚点                 
                currentNav;                             // 当前article

            // 如果有hash，定位到对应的导航,否则定位到第一个导航
            currentAnchor = hash.length ? container.find('a[href=' + hash + ']') : container.find('a:eq(0)');
            currentAnchor.addClass('current');
            currentAnchor.closest('li.nav-parent').addClass('current');
            currentNav = $(currentAnchor.attr('href'));

            // 侧边导航点击事件
            container.on('click', 'a', function(e){

                var _this = $(this);

                // container.find('a').removeClass('current');
                // container.find('li.nav-parent').removeClass('current');
                currentAnchor.removeClass('current').closest('li.nav-parent').removeClass('current');
                _this.addClass('current').closest('li.nav-parent').addClass('current');

                currentAnchor = _this;
                currentNav = $(currentAnchor.attr('href'));

                if( !self.isWrap() ){

                    self.setHeight();

                }

            });

            // 滚动事件
            win.on('scroll', function(){

                var nextNav = null,         // 下一篇文章
                    nav,                    
                    index,
                    top = doc.scrollTop(),
                    r;                      // 方向，1为向下，-1为向上

                r = top > currentScrollTop ? 1 : -1;    // 判断方向
                currentScrollTop = top;

                navLength = self.navs.length - 1;
                index = currentAnchor ? self.navs.indexOf(currentAnchor.attr('href')) : -1;
                nav = self.navs[[0, index + r, navLength].sort(function(a, b){

                    return a - b

                })[1]];
                nextNav = $(nav);

                if( r === 1 && nextNav.offset().top < doc.scrollTop() + 64 ){

                    nav = container.find('a[href=' + nav + ']');
                    currentAnchor.removeClass('current').closest('li.nav-parent').removeClass('current');

                    currentAnchor = nav;
                    currentAnchor.addClass('current').closest('li.nav-parent').addClass('current');
                    currentNav = $(currentAnchor.attr('href'));

                }else if( r === -1 && currentNav.offset().top > doc.scrollTop() + 64 ){

                    nav = container.find('a[href=' + nav + ']');
                    currentAnchor.removeClass('current').closest('li.nav-parent').removeClass('current');

                    currentAnchor = nav;
                    currentAnchor.addClass('current').closest('li.nav-parent').addClass('current');
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
                navParents = container.find('> ul > li.nav-parent'),
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

                navParents.find('> ul').show();
                return;

            }

            currentNav = container.find('> ul > li.current');
            height = len * 48;

            // 先判断是否只能容纳一级菜单
            if( height + 24 > viewH ){

                navParents.find('>ul').hide();
                return;

            }

            // 判断当前菜单是否展开，再循环前后的菜单是否展开
            nav = navParents.filter('.current');
            index = navParents.index(nav);
            navChilds = nav.find('> ul > li.nav-child');
            cLen = navChilds.length;
            height = height + cLen * 24;

            while( height < viewH ){

                navShow = navShow ? navShow.add(nav) : nav;

                index = index + add * r;
                r = -1 * r;
                add += 1;

                if( index < 0 || index > len ){

                    continue;

                } 

                nav = navParents.eq(index);
                navChilds = nav.find('> ul > li.nav-child');
                cLen = navChilds.length;
                height = height + cLen * 24;

            }

            // todo: 加上一些判断，只有当current值改变的时候，才考虑
            navParents.find('> ul').hide();
            navShow.find('> ul').show();
        },
        // 判断侧边栏的高度是否能完整容纳所有的导航
        isWrap: function(){
            var self = this,
                navParents = self.container.find('> ul > li.nav-parent'),
                navChilds = navParents.find('> ul > li.navChilds'),
                pLen = navParents.length,
                cLen = navChilds.length,
                viewH = win.height() - 56;

            return pLen * 48 + cLen * 24 < viewH;
        }
    };

    sidebar.prototype.init.prototype = sidebar.prototype;

    /**
     * 模板渲染
     * @param  {String}         tpl  模板
     * @param  {Object}         data 数据
     * @return {HTML String}    tpl  
     */
    function _template(tpl, data) {
        for(var each in data){
            tpl = tpl.replace(new RegExp('#\{' + each + '\}', 'g'), data[each]);
        }
        return tpl;
    }

    return sidebar;
});