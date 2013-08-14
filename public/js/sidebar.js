/*
 * @Author      changbin.wangcb
 * @Date        2013.07.09
 * @Description sidebar
 */

jQuery.namespace('lightWeb');
(function ($, win, doc, LW) {
    var tmpl = '<article class="code-mirror #{type}" id="a-#{id}" data-id="#{id}">\
                    <h3>#{name}</h3>\
                    <a href="#" class="edit"><i class="icon-edit"></i>edit</a>\
                    <!--ko template: {name: "temp-article-#{type}"}--><!--/ko-->\
                </article>',
        win = $(win),
        doc = $(doc);

    function sidebar(elem){
        return new sidebar.prototype.init(elem);
    } 

    sidebar.prototype = {
        constructor: sidebar,
        init: function(elem){
            this.container = $(elem);
            this.navs = [];
            this.map = {};
        },
        // ��Ⱦarticle && ��ȡ�Ҳർ����Ϣ
        render: function(dtd){
            var self = this,
                $sections = $('#content div.content-inner > section'),
                $article,
                $items = self.container.find('> ul > li.nav-parent');

            if( !$items.length ){
                return;
            }

            $items.each(function(idx, el){

                var _this = $(el),
                    $childs = _this.find('> ul > li.nav-child'),
                    $child, i, l;

                self.navs.push( _this.find('h2 a').attr('href') );

                if( $childs.length ){

                    for( i = 0, l = $childs.length; i < l; i++ ){
                        
                        $child = $childs.eq(i).find('> a');

                        $article = $( _template( tmpl, {
                            'id': $child.data('id'),
                            'name': $child.text(),
                            'type': $child.data('type') || 'n'
                        } ) ).insertBefore( $sections.eq(idx).find('> footer') );

                        self.navs.push( $child.attr('href') );

                    }
                }

            });

            dtd.resolve();

            self.bindEvent();
            self.setHeight();
        },
        /**
         * ���������ڵ㣬��Ⱦarticle
         * @param  {Number}         idx  section index
         * @param  {Object}         data �ڵ���Ϣ
         * @param  {Deferred}       dtd  
         * @return {jQuery Element}      ������article�ڵ�
         */
        add: function(idx, data, dtd){
            var self = this,
                $parent = this.container.find('> ul').eq(idx),
                $section = $('#content div.content-inner > section').eq(idx),
                $li,
                $article,
                idx, pArr = [], nArr = [];

            // ���������ڵ�
            $li = $('<li class="nav-child">');
            $('<a>').attr('href', '#a-' + data.id).attr('data-id', data.id).attr('data-type', data.type).text(data.name).appendTo($li);
            $li.appendTo($parent.find('ul'));

            // ����article
            $article = $( _template( tmpl, {
                'id': data.id,
                'name': data.name,
                'type': data.type
            } ) ).insertBefore( $section.find('> footer') );

            // ��navs����������½ڵ�
            idx = self.navs.indexOf($li.prev('li').find('a').attr('href'));
            pArr = self.navs.slice(0, idx + 1);
            nArr = self.navs.slice(idx + 1, self.navs.length);
            pArr.push('#a-' + data.id);
            self.navs = pArr.concat(nArr);
            
            self.setHeight();
            dtd.resolve($article);
        },
        // ��λ�¼�
        bindEvent: function(){
            var self = this,
                container = self.container,
                hash = location.hash,                   // hash
                currentScrollTop = doc.scrollTop(),     // �����ĵ���ǰ��scrollTop�����������ʱ�������жϷ���
                navLength,
                currentAnchor = null,                   // ��ǰ��ê��                 
                currentNav;                             // ��ǰarticle

            // �����hash����λ����Ӧ�ĵ���,����λ����һ������
            currentAnchor = hash.length ? container.find('a[href=' + hash + ']') : container.find('a:eq(0)');
            currentAnchor.addClass('current');
            currentAnchor.closest('li.nav-parent').addClass('current');
            currentNav = $(currentAnchor.attr('href'));

            // ��ߵ�������¼�
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

            // �����¼�
            win.on('scroll', function(){

                var nextNav = null,         // ��һƪ����
                    nav,                    
                    index,
                    top = doc.scrollTop(),
                    r;                      // ����1Ϊ���£�-1Ϊ����

                r = top > currentScrollTop ? 1 : -1;    // �жϷ���
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
        // ����Ӧ�߶�
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

            // ���ж��Ƿ�ֻ������һ���˵�
            if( height + 24 > viewH ){

                navParents.find('>ul').hide();
                return;

            }

            // �жϵ�ǰ�˵��Ƿ�չ������ѭ��ǰ��Ĳ˵��Ƿ�չ��
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

            // todo: ����һЩ�жϣ�ֻ�е�currentֵ�ı��ʱ�򣬲ſ���
            navParents.find('> ul').hide();
            navShow.find('> ul').show();
        },
        // �жϲ�����ĸ߶��Ƿ��������������еĵ���
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

    LW.sidebar = sidebar;

    /**
     * ģ����Ⱦ
     * @param  {String}         tpl  ģ��
     * @param  {Object}         data ����
     * @return {HTML String}    tpl  
     */
    function _template(tpl, data) {
        for(var each in data){
            tpl = tpl.replace(new RegExp('#\{' + each + '\}', 'g'), data[each]);
        }
        return tpl;
    }

})(jQuery, window, document, lightWeb);