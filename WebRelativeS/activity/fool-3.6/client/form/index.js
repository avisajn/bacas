require("./index.scss");
require("../common/common.js");
var Store = require("../util/store.js");
var Base64 = require('js-base64').Base64;
const maxLen = {
	0 : 5, // 男性的模版个数
	1 : (window.lan == 'yn' ? 7 : 5), // 女性的模版个数
}

require('./logo-bx.png');
require('./logo-yn.png');
require('./main-bx.png');
require('./main-yn.png');


var getRandom = function (under, over){ 
	switch(arguments.length){
		case 1: return parseInt(Math.random()*under+1); 
		case 2: return parseInt(Math.random()*(over-under+1) + under); 
		default: return 0; 
	}
}

$(function () {
    var $name = $('#name');
    const inputInfo = Store.get('inputInfo');
    if(inputInfo){
        $name.val(inputInfo.name);
        const sex = inputInfo.sex;
        $('input[name="sex"]').map(function(){
            var _this = $(this);
            if(_this.attr('value') == sex){
                _this.attr('checked' ,true);
            }
        })
    }

    var isRedirect = false;

    var createLink = function(){
        if(isRedirect){return; }
        isRedirect = true;
        const sex  = $('input[name="sex"]:checked').val();
        const name = $name.val();
        if(!name){$name.addClass('none-estimate').focus(); return; }
        else{$name.removeClass('none-estimate'); }
        // 这里验证！
        const max_num = maxLen[sex];    // 5
        var overList = Store.get('over'+sex) || {};
        var _knum = null;
        for(var i=0;i < max_num*4;i++){
            _knum = getRandom(0,max_num-1);
            if(!overList[_knum]){break; }
        }
        overList[_knum] = true;
        // 如果满了，则清空对象
        var _i = 0;
        for(var k in overList){_i++;}
        if(_i == max_num){overList = {}; }
        Store.set('over'+sex,overList);
        Store.set('inputInfo',{name : name , sex : sex });
        const str = _knum+'='+sex+'='+name+'='+getRandom(20000 ,30000)+'='+getRandom(9000 ,10000)+'='+(new Date()).Format("MM/dd hh:mm");
        window.location.href = '/'+Base64.encode(str);
        setTimeout(function(){
            isRedirect = false;
        },1000);
    }

    $('body').on('clickover' ,'#btnSubmit' ,function () {
        createLink();
    });

    $('#btnSubmit').click(function(){
        setTimeout(function(){
            createLink();
        },400);
    })
})
