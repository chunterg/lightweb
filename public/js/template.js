/*
 * @Author      changbin.wangcb
 * @Date        2013.10.08
 * @Description 简单的模板引擎
 */

define(['jquery'], function($){
    return function (tpl, data) {
        for(var each in data){
            tpl = tpl.replace(new RegExp('#\{' + each + '\}', 'g'), data[each]);
        }

        return tpl;
    }
});