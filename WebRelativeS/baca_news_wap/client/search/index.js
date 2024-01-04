require("./index.scss");
require("../common/common.js");

require('../common/img/search-1.png');
require('../common/img/search-2.png');
require('../common/img/search-3.png');
require('../common/img/search-4.png');
require('../common/img/search-none.png');


var API = require('../util/api.js');
var Store = require('../util/store.js');

require('../common/scrollImg.js');

var $searchPanel = $('.search-panel');
var $input = $('#inputKey');
var $dataPanel = $('#searchList');

var Local = require('../util/local.js');
var Country = Local[window.lan];
var thumbImgUrl = Country['imgHost']+'api/v1/NewsImage/'; //缩略图：


$(function(){
	var $btnSearch = $searchPanel.find('.search-head .n-right');
	var pathKey = window.Tools.getQuery('key');
	if(pathKey){
		Record.set(pathKey);
		$input.val(pathKey);
		Search(pathKey);
	}else{
		var localData = Store.getSession('recordData');	// 判断本地有么有，有的话，加载html
		if(localData && localData.key){
			$searchPanel.removeClass('search-index-panel');
			$input.val(localData.key);
			loadRecordHtml(localData);
		}
	}

	// 单击遮罩层，隐藏历史纪录
	$searchPanel.on('click','.mask' ,function(){
		Record.hide();
	});

	// 单击输入框，判断是否存在搜索历史，有的话，弹出选择纪录
	$searchPanel.on('click' ,'.input>input' ,function(){
		Record.show();
	});

	// 单击选项框的叉的时候，从storage中删除此值
	$searchPanel.on('click' ,'.more-panel .close' ,function(e){
		const key = $(this).prev('.text').text();
		Record.remove(key);
	});

	// 单击选项框的文字的时候，应该设置输入内容为 选择的，并搜索
	$searchPanel.on('click' ,'.more-panel .text' ,function(){
		const key = $(this).text();
		$input.val(key);
		Record.hide();
		Search(key);
	});

	// 单击清空纪录的时候，被触发
	$searchPanel.on('click' ,'.more-panel .btn-clear' ,function(){
		Record.clear();
		Record.hide();
	});

	// $(document).keydown(function(e) {
	//    if (e.keyCode == 13) {
	//    		$btnSearch.click();
	//    }
	// })

	$input.bind('keypress',function(event){
	    if(event.keyCode == "13") {
	       $btnSearch.click();
	     }
	});

	// 单击搜索的时候，触发此事件
	$searchPanel.on('click' ,'.search-head .n-right' ,function(){
		const key = $input.val();
		if(!key) {
			$searchPanel.addClass('search-index-panel').removeClass('show-history none-data');
			return;
		}
		$searchPanel.removeClass('search-index-panel');
		Record.set(key);
		Record.hide();
		// window.location.href = '/search?key='+key;
		Search(key);
	});

	$searchPanel.on('click' ,'.search-head .n-left' ,function(){
		window.history.go(-1);
	});

	$searchPanel.on('click' ,'#imgList>li>img' ,function(){
		$searchPanel.removeClass('preview-atlas');
		window.Link._atlasPanel.hide();
	})
});

// 高亮某个字段
var setHightLight = function(key){
	var reg = new RegExp(key,"ig");
	$dataPanel.find('section .title').each(function(){
		var _this = $(this);
		var str = _this.text();
		_this.html(str.replace(reg, '<span class="hight-light">'+key+'</span>'));
	});
}
var currentSum = 0;
var loadRecordHtml = function(v){
	// 数据为空
	const count = v.Count;
	if(v.err || count <= 0 || v.timeout){
		$searchPanel.addClass('none-data');
		$searchPanel.removeClass('search-loading');
		return;
	}
	const data = v.News;
	var html = [];
	var _item = API.item;
	currentSum = data.length;
	for(var i=0,len=data.length,k;i<len;i++){
		k = data[i];
		if(k.Type === 0){
          html.push(_item._getNewsItem(k ,len-i ,'search'));
        }else if(k.Type === 1){
          html.push(_item._getFunnyPicItem(k ,len-i ,'search'));
        }else if(k.Type === 2){
          html.push(_item._getAtlasItem(k ,len-i ,'search'));
        }else if(k.Type === 3){
          html.push(_item._getVideoItem(k ,len-i ,'search'));
        }
	}
	$dataPanel.html(html.join(''));
	$searchPanel.removeClass('search-loading none-data');
	setHightLight(v.key);
}
var Search = function(key){
	$searchPanel.addClass('search-loading');
	$searchPanel.removeClass('search-index-panel');
	API.getSearchList(key ,-1 ,function(v){
		v.key = key;
		Store.setSession('recordData' ,v);
		loadRecordHtml(v);
	});
}

window.Link = {
	_atlasPanel : $('#atlasPanel'),
	_atlasText : $('#atlasText'),
	_bodyWidth : $('html').width(),
	_bodyHeight : window.screen.height,
	toInfo : function(link){
		window.location.href = link+'&ab='+(window.ab_showComments?'comments':'views')+'&m='+currentSum+'&u='+window.header['X-User-Id'];
	},
	toAtlas : function(id){
		var data = Store.get('atlas-:'+id);
		if(!data) return;
		var self = this;
		$searchPanel.addClass('preview-atlas');
		var $panel = self._atlasPanel ,
			_width = self._bodyWidth,
			_height = self._bodyHeight,
			items = data.Images;

		var loadAtlasHtml = function(){
			var html = [];
			for(var i=0,len=items.length,k;i<len;i++){
				k = items[i];
				html.push('<li style="width:'+_width+'px;height:'+ _height+'px;line-height:'+(_height/5*4)+'px;"><img src="'+thumbImgUrl.replace('{`url`}',k.ImageGuid)+'" /></li>')
			}
			$panel.children('#atlasText').text(items[0].Description);
			$panel.children('.title').text(data.Title);
			$panel.find('#imgList').html(html.join(''));
		}
		loadAtlasHtml();
		$.mggScrollImg('#atlasPanel .imgbox ul',{
	        loop : false,//循环切换
	        auto : false,//自动切换
	        width : self._bodyWidth,
	        callback : function(ind){//这里传过来的是索引值
	        	self._atlasText.text(items[ind].Description)
	        }
	    });
		this._atlasPanel.show();
	}
}

var Record = (function(){
	var $recordList = $('#recordList');
	var loadHtml = function(data){
		var html = [];
		for(var i=0,len=data.length;i<len;i++){
			html.push('<li> <span class="text">'+data[i]+'</span> <span class="close"></span> </li>');
		}
		$recordList.html(html.join(''));

	}
	loadHtml(Store.get('record') || []);

	return {
		show : function(){
			const record = Store.get('record');
			if(record && record.length > 0){
				$searchPanel.addClass('show-history');
			}
		},

		hide : function(){
			$searchPanel.removeClass('show-history');
		},

		set : function(key){
			var record = Store.get('record') || [];
			// 判断是否存在，不存在的话，则增加
			if(!inArray(key ,record)){
				record.push(key);
				Store.set('record' ,record);
				loadHtml(record);
			}
		},

		clear : function(){
			Store.clear('record');
			$recordList.html('');
		},

		remove : function(key){
			var record = Store.get('record') || [];
			var newList = [];
			for(var i=0,len=record.length;i<len;i++){
				if(record[i] != key ){
					newList.push(record[i]);
				}
			}
			Store.set('record' ,newList);
			loadHtml(newList);
			if(newList.length == 0){
				$searchPanel.removeClass('show-history');
			}
		}
	}
}());

function inArray(needle,array,bool){    
    if(typeof needle=="string"||typeof needle=="number"){    
        for(var i in array){    
            if(needle===array[i]){    
                if(bool){    
                    return i;    
                }    
                return true;    
            }    
        }    
        return false;    
    }    
}    

