require("./index.scss");
require("../common/common.js");


var Api = require('../util/api.js');
var Store = require('../util/store.js');

$(function () {
	var $showUl = $('#ulShowList');
	var $hideUl = $('#ulHideList');

	var setCategoryStatus = function(cid ,status){
        var data = Store.get('_categoryList');
        for(var i=0,len=data.length;i<len;i++){
        	if(data[i].CategoryId == cid){
                data[i].noshow = status;
            }
        }
        Store.set('_categoryList' ,data ,60*60*24*2);
    }
    var splity = $('body').width() <= 355; // 如果屏幕宽度大于355，则不需要分割
    var loadHtml = function(dataAll){
        var showList = [],
            hideList = [];

        for(var i=0,len=dataAll.length,k ,kn ,kl ,isBig ,ko;i<len;i++){
            k = dataAll[i];
            if(k.Type == 'Trending'){
                // continue;
            }
            isBig = '';
            kn = k.Name;
            ko = kn;
            if(kn.length > 15 || (splity && kn.length > 10)){
                if(kn.indexOf(' ')<0){
                  kl = kn.length ;
                  kn = kn.substring(0,parseInt(kl/2))+' '+kn.substring(parseInt(kl/2));
                }
                isBig = 'big';
            }  
            if(k.noshow){
                hideList.push('<li class="'+isBig+'"><div cid="'+k.CategoryId+'" class="a-bouncein">'+kn+'</div></li>');
            } else{
                showList.push('<li class="'+isBig+'"><div cid="'+k.CategoryId+'" class="a-bouncein '+(k.move == 'false' ? 'disable' : '')+'">'+kn+'</div></li>');
            }
        }

        $showUl.html(showList.join(''));
        $hideUl.html(hideList.join(''));

        $showUl.on('click' ,'[cid]',function(){
            var _this = $(this);
            if(_this.hasClass('disable')) return;
            var _p = _this.parent('li');
            var cid = _this.attr('cid');
            $hideUl.append('<li class="'+(_p.hasClass('big')?'big':'')+'"><div cid="'+cid+'">'+_this.text()+'</div></li>');
            _this.parent('li').remove();
            setCategoryStatus(cid ,true);
        })

        $hideUl.on('click' ,'[cid]',function(){
            console.log()
            var _this = $(this);
            var cid = _this.attr('cid');
            var _p = _this.parent('li');
            $showUl.append('<li class="'+(_p.hasClass('big')?'big':'')+'"><div cid="'+cid+'">'+_this.text()+'</div></li>');
            _this.parent('li').remove();
            setCategoryStatus(cid ,false);
        })
    }

	
	Api.getCategory(function(e){
        var dataAll = e.dataAll;
        loadHtml(dataAll);
	})
})


window.headerRedirect = function(){
    Api.logging.adjustCategoryOrder();
    setTimeout(function(){
        window.location.href = '/';
    },200);
}