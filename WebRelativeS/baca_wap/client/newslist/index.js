
require("./index.scss");
require("../common/common.js");

require('../common/img/eye.png');
require('../common/img/eye1.png');

require('../common/img/download-index-bx.png');
require('../common/img/download-index.png');
require('../common/img/download-index-me.png');

require('../common/img/ad.jpg');

var Api = require('../util/api.js');
var Store = require('../util/store.js');
var Local = require('../util/local.js');
// require('../util/ab.js');
var Country = Local[window.lan];

// 在newslist写入一个not allow app ，在详情页打开的时候判断，如果存在值则不需要打开app，否则打开app
Store.setSession('notAllowOpenApp' ,true);
window.ga('send', 'event', 'list', 'from', Tools.getQuery('origin') || 'default');
Store.removeSession('recordData');
function showGaAbTest(){
	var ab_show300250ad = Store.getSession('list-feed-ad');
	var ab_showComments = Store.getSession('ab-showComment');
	// 统计列表页300*250的广告的概率
	if(typeof(ab_show300250ad) == 'undefined' || ab_show300250ad == null){
		// 广告流显示300*250的广告
		if(Math.random() >= 0.5){ // 50%的概率，显示300*250的广告
			ab_show300250ad = true;
		}else{
			ab_show300250ad = false;
		}
		Store.setSession('list-feed-ad' ,ab_show300250ad);
	}
	// // 统计列表页显示评论数和浏览数
	// if(typeof(ab_showComments) == 'undefined' || ab_showComments == null){
	// 	if(Math.random() >= 0.5){ // 50%的概率，显示300*250的广告
	// 		ab_showComments = true;
	// 	}else{
	// 		ab_showComments = false;
	// 	}
	// 	Store.setSession('ab-showComment' ,ab_showComments);
	// }
	// window.ab_showComments = ab_showComments; 
	window.ab_show300250ad = ab_show300250ad;

	var ad_slot = Country['ad'];
	if(ab_show300250ad == true){
		window.ad_slot = ad_slot['newsfeed300250'];
	}else{
		window.ad_slot = ad_slot['newsfeed'];
	}

	console.log('ab_show300250ad:',ab_show300250ad);
	// console.log('ab_showComments:',ab_showComments);	
}

showGaAbTest();


if(window.lan == 'me'){
	$('.container-body').attr('dir' ,'rtl').addClass('container-me');
}


// $('#newsList').on('error' ,'img' ,function(){
// 	console.log('img eerr');
// })

var CurrentPage = 'list';
var thumbImgUrl = Country['imgHost']+'{`url`}_thumbnail'; //缩略图：
// var thumbImgUrl = Country['imgHost']+'api/v1/NewsImage/'; //缩略图：

var $pullTarget = $('body');
// 类型对象
var Category = (function(){
	var $header = $('#menuList');
	var $topMenu = $('.top_menu');

	var screenWidth = $('body').width(),	
		screenOffset = parseInt(screenWidth/2 + screenWidth/50);

	var objData = []; // 所有的数组
	var objNow = {CategoryId:'-1' ,Type:'All'};
	// if(window.lan == 'me'){
	// 	objNow = {CategoryId:'1' ,Type:'News'};
	// }
	var loadEvent = function(){
		$header.children('[cid]').on('click' ,function(){
			var _this = $(this);
			var cid = _this.attr('cid');
			$header.children('.cur').removeClass('cur');
			_this.addClass('cur');
			Loading.reset();
			objNow = getCategoryItemById(cid);
			Store.setSession('_categoryNow',objNow)
			setNowStyle();
			NewsList.loadNewsPanel(objNow);
			if(typeof(adhoc) != 'undefined'){
				adhoc.incrementStat('clickCategoryLowNums', 1)
			}
		})
	},

	setNowStyle = function(){
		var offset = 0;
		var nums = 0;
		var over = false;
		var lastWidth = 0;
		$header.children('[cid]').each(function(){
			if(over) return;
			var _this = $(this);
			lastWidth = _this.width();
			offset += lastWidth;
			nums++;
			if(_this.hasClass('cur')){
				over = true;
				return;
			}
		});
		offset -= screenOffset - (nums * 5) + (lastWidth/2);
		if(offset<0) offset = 0;
		$topMenu.scrollLeft(offset);
	},

	setHtml = function(getData){
		var html = [];
		var _nowId = objNow.CategoryId || 0;
		var _data = objData;
		for(var i=0,len=_data.length,k,d;i<len;i++){
			k = _data[i];
			html.push('<a href="javascript:;" cid="'+k.CategoryId+'" class="act '+(k.CategoryId==_nowId?'cur':'')+'">'+k.Name+'</a>')
		}
		$header.html(html.join(''));
		loadEvent();
		setNowStyle();
	},

	getCategoryItemById = function(nid){
		var data = objData;
		for(var i=0,len=data.length;i<len;i++){
			if(data[i].CategoryId == nid){
				return data[i];
			}
		}
		return null;
	}

	Api.getCategory(function (_e) {
		objData = _e.data ;
		var _now  = Store.getSession('_categoryNow');
		if(_now && typeof(_now.CategoryId)!='undefined'){
			objNow = _now;
		}else{
			objNow = objData[0];
		}
		setHtml();
	});

	return {
		getNow : function(){
			return objNow;
		},

		setHtml : function(){
			setHtml();
		}
	}
}());


window.ab_showComments = false;
var ABTest = function(){
	window.ab_showComments = false;
	adhoc.setFlagDef({'showReading':true })//设置试验变量默认值（网络异常或获取试验变量失败时使用）
    adhoc.init('ADHOC_f9c0ffb7-d21e-4297-b66d-0a451468211d',window.header['X-User-Id']);//初始化

    adhoc.getExperimentFlags(function(flags){
    	console.log('showReading:' ,flags.get('showReading'));
    	window.ab_showComments = !flags.get('showReading');
    	NewsList.initEmptyList();
    });
};

// 加载相关事件
var Loading = (function(){
	var $loading = $('#myLoading');
	var $update = $('#updNumber');
	var $rightLoading = $('#rightReloading');

	var _interTime = null;
	var isLoading = false;
	

	return {
		showLoading : function(){
			if(isLoading) return;
			isLoading = true;
			$loading.show(100);
		},

		hideLoading : function(){
			if(!isLoading) return;
			$loading.hide(100);
			isLoading = false;
		},

		showUpdate : function(num,txt,_type){
		    var msg = '';
		    var category = Category.getNow();
		    var type = category.Type || _type;
			if(!num || num === 0){
		        if(type == 'Trending'){
		            msg = Country.language['blueFreshMessage-trending-null'];
		        }else{
		            msg = Country.language['blueFreshMessage-null'];
		        }
			}else{
		        if(type == 'Trending'){
		            msg = num + ' '+Country.language['blueFreshMessage-trending-num'];
		        }else{
		            msg = num + ' '+Country.language['blueFreshMessage-num']+' '+txt;
		        }
			}
		    $update.text(msg).css('opacity' ,'1');
			if(window._timeUpdNumber){
				clearTimeout(window._timeUpdNumber);
			}
			window._timeUpdNumber = setTimeout(function(){
				$update.css('opacity' ,'0');
				clearTimeout(_interTime);
			},3000);
		},

		reset : function(config){
			config = $.extend({
				pull : true ,	// 重置下拉
				loading : true ,// 重置loading
				ajax : true ,	// 重置ajax
				rightLoading : true,	// 右侧rightLoading
			},config);

			$update.css('opacity' ,'0');

			if(config.loading && isLoading) {
				$loading.hide();
				isLoading = false;
			}
			if(config.pull && $pullTarget.pullToRefreshDone){
				$pullTarget.pullToRefreshDone();
			}

			if(config.rightLoading && $rightLoading.hasClass('rotate')){
				$rightLoading.removeClass('rotate');
			}

			var ajaxReq = window.ajaxReq;
			console.log('ajaxReq:', ajaxReq);
			if(config.ajax && ajaxReq && ajaxReq.url.indexOf('category')<0 ){
				ajaxReq.value.abort();
				window.ajaxReq = null;
			}
		}
	}
}());

var $newsPanel = $('#newsList');

var altas_scroll = 0;
// 新闻对象
var NewsList = (function(){
	var $panel = $('#newsList');
	var _item = Api.item;

	/**
	 * 根据数据获得HTML
	 * @param  {[type]} data 数据
	 * @param  {[type]} sum  此类数据总和（旧的＋刚请求的数据）
	 */
	var getNewsHtml = function(data ,sum ,adsIndex){
		var ad1 = 100 ,ad2=100;
		if(typeof(adsIndex) == 'undefined' || adsIndex.length == 0){
			ad1 = 2;
			ad2 = 7;
		}else{
			ad1 = adsIndex[0];
			if(adsIndex.length == 2){
				ad2 = adsIndex[1];
			}
		}
		var html = [];
		for(var i=0,len=data.length,k;i<len;i++){
			k = data[i];
			if(!k) continue;
	        if(k.TrendingId){
	            if(k.TrendingId == 'none'){
	              html.push('<section class="new-content item-trendinglist"></section>');
	            }else{
	              html.push(_item._getTrendingList(k ,sum-i));
	            }
	        }else{
	        	if(ab_show300250ad == true){
	        		if(i == ad1){
	        			html.push(_item._getAd300250());
	        		}
	        	}else{
		        	if(i == ad1 || i == ad2){	// 显示两个广告
			            html.push(_item._pushAd());
			        }
	        	}
	        	//
	            if(k.Type === 0){
	              html.push(_item._getNewsItem(k ,sum-i));
	            }else if(k.Type === 1){
	              html.push(_item._getFunnyPicItem(k ,sum-i));
	            }else if(k.Type === 2){
	              html.push(_item._getAtlasItem(k ,sum-i));
	            }else if(k.Type === 3){
	              html.push(_item._getVideoItem(k ,sum-i));
	            }
	        }
		}
		return html.join('');
	},

	getTip = function(ctip){
		if(window.lan == 'bx'){ // 默认印尼不赋值
          if(ctip == 'Joke') ctip='humores';
          else if(ctip == 'Video') ctip = 'vídeos';
          else ctip = 'artigos';
        }else if(window.lan == 'yn'){
          ctip = 'baru';
        }else{
        	ctip='';
        }
        return ctip;
	},

	resetAd = function(){
		// return;
		setTimeout(function(){
			$('.ads-inline').each(function(){
				var _this = $(this);
				if(_this.height() < 100){
					_this.hide();
				}
			})
		},1500);
	},

	// 当panel为空，切换category，第一次进入时，获取数据应该调用此方法
	loadEmptyList = function(category ,callback){
		var cid = category.CategoryId ;
		var ctype = category.Type;

		Loading.reset();

		var $current = $panel.children('[cid="'+cid+'"]');
		$panel.children('.current').removeClass('current');

		// 数据为空
		if(!$current || $current.length <= 0 || $current.attr('empty') == 'true'){
			$current = $('<div empty="true" class="panel-item '+ctype+'-list current" ctype="'+ctype+'" cid="'+cid+'"><div class="none-list"><img src="/common/img/loading.gif"></div></div>');
			$panel.append($current);

			var assembly = function(_data ,ads ,hideTips){
				if(!_data){
					return;
				}
				Store.set('cid:'+cid ,_data, 60*10);	// 默认为10分钟的过期时间
				// 判断历史数据
				var oldNum = $current.attr('oldnum');
		        if(!oldNum){
		          oldNum = Store.getSession('currentSum') || 0;
		        }

		        var sumNum = parseInt(oldNum)+_data.length;
				$current.attr('empty','false').attr('oldnum' ,sumNum);		

				var html = getNewsHtml(_data ,sumNum ,ads);

		       	var len = _data.length;

		       	$current.html(html);
		        // Loading.reset();
		        if(!hideTips){
		        	Loading.showUpdate(len ,getTip(ctype));
		        }
		        resetAd();
		        if(!callback){
		        	document.body.scrollTop = 0;
		        	window.ga('send', 'event', 'list', 'autoRefresh', ctype, cid);
		        }else{
		        	window.ga('send', 'event', 'list', 'switchCategory', ctype, cid);
		        	callback();
		        }        
			}

			// 判断SESSION中是否有
			var data = Store.get('cid:'+cid);
			if(data && data.length > 0){
				assembly(data ,[2,7] ,true);
			}

			// 没有的话，重新获取
			else{
				if(ctype == 'News' || ctype == 'All' || ctype == 'Video'){
	                Api.getNewsList(cid ,assembly)
	            }else if(ctype == 'Joke'){
	                Api.getJokeList(cid ,assembly);
	            } else if(ctype == 'Trending'){
	                Api.getTrendingList(cid ,assembly);
	            }
			}
		}else{
			$current.addClass('current');
		}
	},

	/**
	 * 加载下拉数据
	 * @param  {[type]} category [description]
	 * @param  {[type]} reslove  [description]
	 * @return {[type]}          [description]
	 */
	loadPullList = function(category ,reslove){
		var cid = category.CategoryId ;
		var ctype = category.Type;

		var $current = $panel.children('[cid="'+cid+'"]');
		if($current.children('.none-list').length > 0){
			reslove(ctype ,cid);
			return;
		}
		var assembly = function(_data ,ads){
			// 判断历史数据
			var oldNum = $current.attr('oldnum');
	        if(!oldNum){
	          oldNum = Store.getSession('currentSum') || 0;
	        }

	        var sumNum = parseInt(oldNum);
	        if(ctype != 'Trending'){
	        	sumNum += _data.length;
	        }

			var html = getNewsHtml(_data ,sumNum ,ads);
			$current.attr('empty','false').attr('oldnum' ,sumNum);		
			if(ctype == 'Trending'){
				var diffLen = _data.length - sumNum;
				if(diffLen>0){
					Loading.showUpdate(diffLen);
					$current.html(html);
				}else{
					Loading.showUpdate(0);
				}
			}else{
				Loading.showUpdate(_data.length ,getTip(ctype));
				$current.prepend(html);
			}
			reslove(ctype ,cid);
			_data = _data.concat(Store.get('cid:'+cid));
			Store.set('cid:'+cid ,_data, 60*10);	// 默认为10分钟的过期时间
			resetAd();
		}
		Loading.reset({"pull":false,"rightLoading":false});
		if(ctype == 'News' || ctype == 'All' || ctype == 'Video'){
            Api.getNewsList(cid ,assembly)
        }else if(ctype == 'Joke'){
            Api.getJokeList(cid ,assembly);
        } else if(ctype == 'Trending'){
            Api.getTrendingList(cid ,assembly);
        }
	}

	

	return {
		initEmptyList : function(){
			loadEmptyList(Category.getNow() ,function(){
				document.body.scrollTop = Store.getSession('scrolltop');
			});
		},

		// 切换获取更多
		loadNewsPanel  : function(category){
			loadEmptyList(category);
		},

		// 下拉获取更多
		pullNewsPanel : function(category ,reslove){
			loadPullList(category ,reslove);
		},

		getNewsListHtml : function(data ,sum ,adsIndex){
			return getNewsHtml(data ,sum ,adsIndex);
		}
	}
}());


NewsList.initEmptyList();
// if(typeof(adhoc) == 'undefined'){
	// Category.setHtml();
	// NewsList.initEmptyList();
// }else{	
	// ABTest();
// }

var Trending = (function(){
	var $panel = $('#trendingPanel'),
		$title = $panel.find('#headerText'),

		$dropInfoLayer = $('.dropload-layer'),
		$loading = $('#myLoading'),
		$topNum = $('#updNumber'),

		$trendPanel = $panel.find('#tredingInfoList');



	var nowId = 0;

	var getInfoList = function(id){

		var tempData = Store.get('trendInfo:'+id);
		if(tempData && tempData.length > 0){
			var html = NewsList.getNewsListHtml(tempData ,tempData.length);
			$trendPanel.append(html);
			return;
		}
		Loading.reset();
		Loading.showLoading();
		Api.getTrendingInfoList(id ,function(data ,ads){
			Loading.hideLoading();
			var len = data.length;
			if(len <= 0){
				Loading.showUpdate(0);
			}else{
				Loading.showUpdate(len);
				Store.set('trendInfo:'+id,data);
				var html = NewsList.getNewsListHtml(data ,len,ads[0]);
				$trendPanel.append(html);
			}
		})
	}

	return {
		load : function(id, title){
			CurrentPage = 'trending';
			$trendPanel.html('');
			nowId = id;
			$title.text(title);
			$newsPanel.hide();
			$panel.show().css('display', 'block');
			$dropInfoLayer.css('top' ,50);
			$loading.css('top' ,50);
			$topNum.css('top' ,50);
			Loading.reset();
			Store.setSession('trendNow' ,{id:id ,title:title});
			getInfoList(id);
		},

		hide : function(){
			$dropInfoLayer.css('top' ,90);
			$loading.css('top' ,90);
			$topNum.css('top' ,88);
			CurrentPage = 'list';
			$newsPanel.show();
			$panel.hide();
			Loading.reset();
			document.body.scrollTop = Store.getSession('scrolltop');
			Store.removeSession('trendNow');
		},

		loadMore : function(reslove){
			Loading.showLoading();
			Api.getTrendingInfoList(nowId ,function(data ,ads){
				Loading.hideLoading();
				reslove();
				if(data.length <= 0){
					Loading.showUpdate(0);
				}else{
					Loading.showUpdate(data.length);
					Store.set('trendInfo:'+nowId,data);
					var html = NewsList.getNewsListHtml(data ,data.length,ads[0]);
					$trendPanel.append(html);
				}
			})
		}
	}
}());

window.Link = {
	_atlasPanel : $('#atlasPanel'),
	_atlasText : $('#atlasText'),
	_bodyWidth : $('html').width(),
	_bodyHeight : window.screen.height,
	toInfo : function(link){
		var maxNum = $('#newsList').children('.current').attr('oldnum');
	    if(!maxNum){
	        maxNum = window.sessionStorage.getItem('currentSum') || 0;
	    }
	   //  adhoc.increment('clickDetailsTimes', 1, function(err){
	   //     	if(err){
	   //     		console.log('上传adhoc失败，事件为：clickDetailsTimes，此时的值为：')
	   //     		console.log('showReading:' ,flags.get('showReading'));
	   //         //上报失败会自动重新发送，如果再次发送失败才会执行回调
	   //     	}else{
	   //         //上报成功
	           
	   //     	}
	   //     	window.location.href = link+'&m='+maxNum+'&u='+window.header['X-User-Id'];
	   // });
	   // window.location.href = link+'&m='+maxNum+'&u='+window.header['X-User-Id'];
	   window.open(link+'&m='+maxNum+'&u='+window.header['X-User-Id']);
	   // window.location.href = link+'&m='+maxNum+'&u='+window.header['X-User-Id'];
	},
	toAtlas : function(link){

		var maxNum = $('#newsList').children('.current').attr('oldnum');
	    if(!maxNum){
	        maxNum = window.sessionStorage.getItem('currentSum') || 0;
	    }
	    window.location.href = link+'&m='+maxNum+'&u='+window.header['X-User-Id'];
	    // window.open(link+'&m='+maxNum+'&u='+window.header['X-User-Id']);
	    return;
		// $('#ab-shareInfo').show();
		var data = Store.get('atlas-:'+id);
		if(!data) return;
		var self = this;
		altas_scroll = Store.getSession('scrolltop');
		CurrentPage = 'atlas';
		$newsPanel.hide();
		window.newsId = data.NewsId;
		window.newTitle = data.Title;

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
	},
	toTrending : function(id ,title){
		Trending.load(id ,title);
	},
	toList : function(){
		Trending.hide();
	}
}
// 基本事件
;(function(){
	
	var trendNow = Store.getSession('trendNow');
	if(trendNow){
		Trending.load(trendNow.id ,trendNow.title);
	}


	var $rightLoading = $('#rightReloading'),
		$body = $('body');

	$rightLoading.on('click', function(){
		if($rightLoading.hasClass('rotate') || $body.hasClass('refreshing')){
			return;
		}
		Loading.reset();
		$rightLoading.addClass('rotate');

		if(CurrentPage == 'list'){
			NewsList.pullNewsPanel(Category.getNow() ,function(ctype ,cid){
				document.body.scrollTop = 0;
				$rightLoading.removeClass('rotate');
				window.ga('send', 'event', 'list', 'clickRefresh', ctype, cid);
			});
		}else if(CurrentPage = 'trending'){
			Trending.loadMore(function(){
				$rightLoading.removeClass('rotate');
			})
		}
	})
	var $atlas = window.Link._atlasPanel;
	$atlas.on('click' ,'#imgList img' ,function(){
		$('#ab-shareInfo').hide();
		CurrentPage = 'list';
		$atlas.hide();
		$newsPanel.show();
		document.body.scrollTop = altas_scroll;
	});
}());

var $headerTop = $('#topbar');
window.onscroll = function(){ 
	if(CurrentPage == 'trending' || CurrentPage=="altas"){
    	return;
    }
    var t = document.documentElement.scrollTop || document.body.scrollTop;  
    Store.setSession('scrolltop' ,t);
}




/**
 * 左滑右滑图片
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;(function($){
    /*
        @object config : {
                @Number width : 一次滚动宽度，默认为box里面第一个一级子元素宽度[如果子元素宽度不均匀则滚动效果会错乱]
                @Number size : 列表长度，默认为box里面所有一级子元素个数[如果size不等于一级子元素个数，则不支持循环滚动]
                @Boolean loop : 是否支持循环滚动 默认 true
                @Boolean auto : 是否自动滚动,支持自动滚动时必须支持循环滚动，否则设置无效,默认为true
                @Number auto_wait_time : 自动轮播一次时间间隔,默认为：3000ms
                @Function callback : 滚动完回调函数，参入一个参数当前滚动节点索引值
            }
    */
    function mggScrollImg(box,config){
        this.box = $(box);
        this.config = $.extend({},config||{});
        this.width = this.config.width||this.box.children().eq(0).width();//一次滚动的宽度
        this.size = this.config.size||this.box.children().length;
        this.loop = this.config.loop||true;//默认能循环滚动
        this.scroll_time = 300;//滚动时长
        this.minleft = -this.width*(this.size-1);//最小left值，注意是负数[不循环情况下的值]
        this.maxleft =0;//最大lfet值[不循环情况下的值]
        this.now_left = 0;//初始位置信息[不循环情况下的值]
        this.point_x = null;//记录一个x坐标
        this.point_y = null;//记录一个y坐标
        this.move_left = false;//记录向哪边滑动
        this.index = 0;
        this.busy = false;
        this.init();
    }
    $.extend(mggScrollImg.prototype,{
        init : function(){
            this.bind_event();
            this.init_loop();
        },
        bind_event : function(){
            var self = this;
            self.box.bind('touchstart',function(e){
                if(e.touches.length==1 && !self.busy){
                    self.point_x = e.touches[0].screenX;
                    self.point_y = e.touches[0].screenY;
                }
            }).bind('touchmove',function(e){
                e.stopPropagation();
                if(e.touches.length==1 && !self.busy){
                    return self.move(e.touches[0].screenX,e.touches[0].screenY);//这里根据返回值觉得是否阻止默认touch事件
                }
            }).bind('touchend',function(e){
                e.stopPropagation();
                !self.busy && self.move_end();
            });
        },
        /*
            初始化循环滚动,当一次性需要滚动多个子元素时，暂不支持循环滚动效果,
            如果想实现一次性滚动多个子元素效果，可以通过页面结构实现
            循环滚动思路：复制首尾节点到尾首
        */
        init_loop : function(){
            if(this.box.children().length == this.size && this.loop){//暂时只支持size和子节点数相等情况的循环
                this.now_left = -this.width;//设置初始位置信息
                this.minleft = -this.width*this.size;//最小left值
                this.maxleft = -this.width;
                this.box.prepend(this.box.children().eq(this.size-1).clone()).append(this.box.children().eq(1).clone()).css(this.get_style(2));
                this.box.css('width',this.width*(this.size+2));
            }else{
                this.loop = false;
                this.box.css('width',this.width*this.size);
            }
        },
        go_index : function(ind){//滚动到指定索引页面
            var self = this;
            if(self.busy)return;
            self.busy = true;
            if(self.loop){//如果循环
                ind = ind<0?-1:ind;
                ind = ind>self.size?self.size:ind;
            }else{
                ind = ind<0?0:ind;
                ind = ind>=self.size?(self.size-1):ind;
            }
            if(!self.loop && (self.now_left == -(self.width*ind))){
                self.complete(ind);
            }else if(self.loop && (self.now_left == -self.width*(ind+1))){
                self.complete(ind);
            }else{
                if(ind == -1 || ind == self.size){//循环滚动边界
                    self.index = ind==-1?(self.size-1):0;
                    self.now_left = ind==-1?0:-self.width*(self.size+1);
                }else{
                    self.index = ind;
                    self.now_left = -(self.width*(self.index+(self.loop?1:0)));
                }
                self.box.css(this.get_style(1));
                setTimeout(function(){
                    self.complete(ind);
                },self.scroll_time);
            }
        },
        complete : function(ind){//动画完成回调
            var self = this;
            self.busy = false;
            self.config.callback && self.config.callback(self.index);
            if(ind==-1){
                self.now_left = self.minleft;
            }else if(ind==self.size){
                self.now_left = self.maxleft;
            }
            self.box.css(this.get_style(2));
        },
        next : function(){//下一页滚动
            if(!this.busy){
                this.go_index(this.index+1);
            }
        },
        prev : function(){//上一页滚动
            if(!this.busy){
                this.go_index(this.index-1);
            }
        },
        move : function(point_x,point_y){//滑动屏幕处理函数
            var changeX = point_x - (this.point_x===null?point_x:this.point_x),
                changeY = point_y - (this.point_y===null?point_y:this.point_y),
                marginleft = this.now_left, return_value = false,
                sin =changeY/Math.sqrt(changeX*changeX+changeY*changeY);
            this.now_left = marginleft+changeX;
            this.move_left = changeX<0;
            if(sin>Math.sin(Math.PI/3) || sin<-Math.sin(Math.PI/3)){//滑动屏幕角度范围：PI/3  -- 2PI/3
                return_value = true;//不阻止默认行为
            }
            this.point_x = point_x;
            this.point_y = point_y;
            this.box.css(this.get_style(2));
            return return_value;
        },
        move_end : function(){
            var changeX = this.now_left%this.width,ind;
            if(this.now_left<this.minleft){//手指向左滑动
                ind = this.index +1;
            }else if(this.now_left>this.maxleft){//手指向右滑动
                ind = this.index-1;
            }else if(changeX!=0){
                if(this.move_left){//手指向左滑动
                    ind = this.index+1;
                }else{//手指向右滑动
                    ind = this.index-1;
                }
            }else{
                ind = this.index;
            }
            this.point_x = this.point_y = null;
            this.go_index(ind);
        },
        /*
            获取动画样式，要兼容更多浏览器，可以扩展该方法
            @int fig : 1 动画 2  没动画
        */
        get_style : function(fig){
            var x = this.now_left ,
                time = fig==1?this.scroll_time:0;
            return {
                '-webkit-transition':'-webkit-transform '+time+'ms',
                '-webkit-transform':'translate3d('+x+'px,0,0)',
                '-webkit-backface-visibility': 'hidden',
                'transition':'transform '+time+'ms',
                
                '-webkit-transform':'translate3d('+x+'px,0,0)',
                '-moz-transform':'translate3d('+x+'px,0,0)',
                '-ms-transform':'translate3d('+x+'px,0,0)',
                '-o-transform':'translate3d('+x+'px,0,0)',
                'transform':'translate3d('+x+'px,0,0)',

            };
        }
    });
    /*
        这里对外提供调用接口，对外提供接口方法
        next ：下一页
        prev ：上一页
        go ：滚动到指定页
    */
    $.mggScrollImg = function(box,config){
        var scrollImg = new mggScrollImg(box,config);
        return {//对外提供接口
            next : function(){scrollImg.next();},
            prev : function(){scrollImg.prev();},
            go : function(ind){scrollImg.go_index(parseInt(ind)||0);},
        }
    }
})($);
/*
 * 扩展方法
 * $.fn.
 * */
+function ($) {
    "use strict";

    $.support = (function() {
        var support = {
            touch: !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof window.DocumentTouch)
        };
        return support;
    })();

    $.touchEvents = {
        start: $.support.touch ? 'touchstart' : 'mousedown',
        move: $.support.touch ? 'touchmove' : 'mousemove',
        end: $.support.touch ? 'touchend' : 'mouseup'
    };

    $.getTouchPosition = function(e) {
        e = e.originalEvent || e;
        if(e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend') {
            return {
                x: e.targetTouches[0].pageX,
                y: e.targetTouches[0].pageY
            };
        } else {
            return {
                x: e.pageX,
                y: e.pageY
            };
        }
    };
}($);

/*
* Pull to refresh
* 使用方法示例：
* $('.dropload').pullToRefresh().on("pull-to-refresh", function () {
*   //do ajax...
*   $('.dropload').pullToRefreshDone();
* });
* */
+function ($) {
    "use strict";

    var PTR = function (el) {
        this.container = $(el);
        this.distance = 50;
        this.attachEvents();
    };

    PTR.prototype.touchStart = function (e) {
    	console.log('touch start');
        if (this.container.hasClass("refreshing")) return;
        var p = $.getTouchPosition(e);
        this.start = p;
        this.diffX = this.diffY = 0;
    };

    PTR.prototype.touchMove = function (e) {
    	console.log('touch touchMove');
        if (this.container.hasClass("refreshing")){ return false; }
        if (!this.start) return false;
        var p = $.getTouchPosition(e);
        var diffY = p.y - this.start.y;
        if(window.showSearch){
        	if(diffY >= 10 || diffY <= -10){
        		$headerTop.removeClass('search-now');
        		window.showSearch = false;
        	}
        }



        if (this.container.scrollTop() > 0) return;
        if(CurrentPage == 'trending' || CurrentPage=="altas"){
        	return;
        }
        this.diffY = diffY;
        this.diffX = p.x - this.start.x;
        if (this.diffY < 0) return;
        this.container.addClass("touching");
        e.preventDefault();
        e.stopPropagation();
        this.diffY = Math.pow(this.diffY, 0.8);
        this.statusArea.css("height", this.diffY);
        if (this.diffY < this.distance) {
            this.container.removeClass("pull-up").addClass("pull-down");
        } else {
            this.container.removeClass("pull-down").addClass("pull-up");
        }
        return false;
    };
    PTR.prototype.touchEnd = function () {
    	console.log('touch touchEnd');
        this.start = false;
        if (this.diffY <= 0 || this.container.hasClass("refreshing") || CurrentPage == 'trending' || CurrentPage=="altas") return;
        this.container.removeClass("touching");
        this.container.removeClass("pull-down pull-up");

        if (Math.abs(this.diffY) <= this.distance) {
            this.statusArea.css("height", 0);
        } else {
            this.statusArea.css("height", 50);
            this.container.addClass("refreshing");
            this.container.trigger("pull-to-refresh");
        }
        return false;
    };

    PTR.prototype.attachEvents = function () {
        var el = this.container;
        el.addClass("dropload");

        var tpl = ['<div class="dropload-layer">', '<div class="inner">','<div class="arrow"></div>',
            '<div class="down">'+Country.language['pull-down']+'</div>',
            '<div class="up">'+Country.language['pull-up']+'</div>', '<div class="refresh"><img src="/common/img/loading.gif" />'+Country.language['loading']+'</div></div></div>'];
        this.statusArea = $(tpl.join('')).prependTo(el);
    };

    PTR.prototype.bindEvent = function(){
        var el = this.container;
        el.on($.touchEvents.start, $.proxy(this.touchStart, this));
        el.on($.touchEvents.move, $.proxy(this.touchMove, this));
        el.on($.touchEvents.end, $.proxy(this.touchEnd, this));
    }

    PTR.prototype.unbindEvent = function(){
        var el = this.container;
        el.off($.touchEvents.start, $.proxy(this.touchStart, this));
        el.off($.touchEvents.move, $.proxy(this.touchMove, this));
        el.off($.touchEvents.end, $.proxy(this.touchEnd, this));
    }

    var myPTR = null;

    var pullToRefresh = function (el) {
        myPTR = new PTR(el);
    };



    var pullToRefreshDone = function (el) {
        $(el).removeClass("refreshing");
        $(el).find('.dropload-layer').css("height", 0);
    };

    $.fn.pullToRefresh = function () {
        return this.each(function () {
            pullToRefresh(this);
        });
    };

    $.fn.pullToRefreshDone = function () {
        this.diffY = 0;
        myPTR.touchEnd();
        return this.each(function () {
            pullToRefreshDone(this);
        });
    };

    $.fn.bindPullRefresh = function(){
        myPTR.bindEvent();
    }

    $.fn.unbindPullRefresh = function(){
        myPTR.unbindEvent();
    }
}($);

$pullTarget.pullToRefresh().on("pull-to-refresh", function () {
	if(CurrentPage == 'list'){
		NewsList.pullNewsPanel(Category.getNow() ,function(ctype ,cid){
			$pullTarget.pullToRefreshDone();
			window.ga('send', 'event', 'list', 'pulldownRefresh', ctype, cid);
		});
	}else if(CurrentPage = 'trending'){
		// $pullTarget.pullToRefreshDone();
		// console.log('trending');
		// Trending.loadMore(function(){
			// $pullTarget.pullToRefreshDone();
		// });
	}
});
$.fn.bindPullRefresh();
