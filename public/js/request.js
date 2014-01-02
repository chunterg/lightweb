/*
 * @Author      changbin.wangcb
 * @Date        2013.10.08
 * @Description ajax-request
 */

define(['jquery'], function($){
    return function (url, opts, dtd, type, method) {
        var param = {},
            domain = 'http://okbeng:88';
        
        if( !url ){
            return;
        }
        
        $.extend(true, param, opts);
        
        $.ajax({
            url: domain + url,
            dataType: type || 'jsonp',
            data: param,
            type: method || 'get',
            success: function(res){
                if( res.status && res.status === 'fail' ){
                    if( res.message && res.message === 'need login first' ){
                        location.href = location.protocol + '//' + location.host + '/user/login';
                        dtd.reject(res.message);
                    }
                }else{
                    dtd.resolve(res);
                }
            },  
            error: function(){
                dtd.reject();
            }
        });
    }
});