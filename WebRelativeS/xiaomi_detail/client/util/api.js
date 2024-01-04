var Local = require('./local.js');
var Store = require('./store.js');
var Fetch = require('./fetch.js');

Fetch.setWindow(window);
var AD_clinetId = Local['adClientId'];
var Country = Local[window.lan];

// var realImgUrl = baseHost+'api/v1/NewsImage/raw/'; //原图：
var thumbImgUrl = Country['imgHost']+'api/v1/NewsImage/{`url`}?allowRedirect=true&thumbnail=true'; //缩略图：
// if(window.lan == 'me'){
	// thumbImgUrl = Country['imgHost']+'{`url`}'; //缩略图：
// }
// var cropImgUrl = baseHost+'api/v1/NewsImage/{`url`}-thumbnail?allowRedirect=true&thumbnail=false'; //切后图：


module.exports = {
	item : {
		_getTitle : function(title){
	        if(window.lan!='me' && title.length > 80) return title.substring(0,70)+'...';
	        return title;
	    },

	    _getReadCount : function(num ,commentCount){
	    	if(window.ab_showComments){
	    		return '<span class="numbers">'+commentCount+'</span><img src="/common/img/eye.png" class="commentIcon"/>';
	    	}else{
		    	if(!num) num = '5k';
		    	else if(num<5000) num = '5k';
		    	else if(num<10000) num = '5k+';
		    	else if(num<50000) num = '10k+';
		    	else if(num<100000) num = '50k+';
		    	else num = '100k+';
		    	return '<span class="numbers">'+num+'</span><img src="/common/img/eye1.png" class="commentIcon"/>';
	    	}
	    },

	    // 得到320*100的广告流
	    _pushAd : function(){
	        var html = [];
	        html.push('<ins class="adsbygoogle ads-inline '+window.lan+'-ads "');
	        html.push('    style="width:100%;height:157px;"');
	        html.push('    data-ad-client="'+AD_clinetId+'"');
	        html.push('    data-ad-slot="'+window.ad_slot+'">');
	        html.push('</ins>');
	        html.push('<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>');
	        return html.join('');
	    },

	    // 得到300*250的广告流
	    _getAd300250 : function(){
	    	var html = [];
	        html.push('<ins class="adsbygoogle ads-inline ads-inline-300250 '+window.lan+'-ads "');
	        html.push('    style="width:100%;height:250px;"');
	        html.push('    data-ad-client="'+AD_clinetId+'"');
	        html.push('    data-ad-slot="'+window.ad_slot+'">');
	        html.push('</ins>');
	        html.push('<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>');
	        return html.join('');	
	    },

	    _getImg : function(src){
	    	return '<img class="lazyload-img" onload="lzld(this)" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="'+thumbImgUrl.replace('{`url`}',src)+'" />';
	    },
	    // i : 指的是第几个，方便统计用
		  // m : 指的是一共多少个
		_getFunnyPicItem:function(k, i){
		    var html = [];
		    html.push('<section class="new-content item-funnyPic">');
		    html.push('  <a class="item-link clearfix " href="javascript:window.Link.toInfo(\'/'+k.NewsId+'?origin=list&n='+i+'&pageId='+k.PageId+'&PageIndex='+k.PageIndex+'\')">');
		    html.push('    <h3 class="title">'+k.Title+'</h3>');
		    html.push('    '+this._getImg(k.ImageGuids[0]));
		    html.push('    <div class="info-tag">');
		    html.push('      <span>'+k.Media+'</span>');
		    html.push('      '+this._getReadCount(k.ReadCount ,k.CommentCount));
		    html.push('    </div>');
		    html.push('  </a>');
		    html.push('</section>');
		    return html.join('');
		},

		_getTrendingTitle : function(t){
			if(t.indexOf("'") > 0){
				t = t.replace(/'/g,"\\'");
			}
			return t;
		},

		_getTrendingList : function(k ,i){
	        var html = [];
	        // k.Title = k.Title + "'";
			var _t = this._getTrendingTitle(k.Title);
	        html.push('<section class="new-content item-trendinglist">');
	        html.push('  <a class="item-link clearfix " href="javascript:window.Link.toTrending(\''+k.TrendingId+'\' ,\''+_t+'\')">');
	        html.push('     '+this._getImg(k.CoverImage['ImageGuid'])+'');
	        html.push('  </a>');
	        html.push('  <a  class="title" href="javascript:window.Link.toTrending(\''+k.TrendingId+'\' ,\''+_t+'\')"><nobr>'+k.Title+'</nobr></a>');
	        html.push('</section>');
	        return html.join('');
	    },


	    _getAtlasItem:function(k, i){
	        var html = [];
	        Store.set('atlas-:'+k.NewsId ,k);
	        html.push('<section class="new-content item-funnyPic item-atlas">');
	        html.push('  <a class="item-link clearfix " href="javascript:window.Link.toAtlas(\''+k.NewsId+'\')">');
	        html.push('    <h3 class="title">'+k.Title+'</h3>');
	        html.push('    '+this._getImg(k.ImageGuids[0]));
	        html.push('    <div class="info-tag">');
	        html.push('      <span>'+k.Media+'</span>');
	        html.push('      '+this._getReadCount(k.ReadCount ,k.CommentCount));
	        html.push('    </div>');
	        html.push('  </a>');
	        html.push('</section>');
	        return html.join('');
	      },

	    _getNewsItem:function(k, i ,origin){
	        var imgs = k.ImageGuids ,
	            imgs_len = imgs.length;
	        var url = '/'+k.NewsId+'?origin='+(origin?origin:'list')+'&n='+i+'&pageId='+k.PageId+'&PageIndex='+k.PageIndex;
	        // if(k.)
	       	if(k.MediaId == 515){
	       		url = k.Url;
	       	}else{
	       		url = 'javascript:window.Link.toInfo(\''+url+'\')';
	       	}
	        var html = [];
	        if(imgs_len == 0){
	          html.push('<section class="new-content item-news-0">');
	          html.push('    <a class="item-link clearfix " href="'+url+'">');
	          html.push('      <div class="info-tag">');
	          html.push('        <span>'+k.Media+'</span>');
	          html.push('      '+this._getReadCount(k.ReadCount ,k.CommentCount));
	          html.push('      </div>');
	          html.push('      <h3 class="title">'+k.Title+'</h3></a>');
	          html.push('</section>');
	        }else if(imgs_len <= 2){
	          html.push('<section class="new-content item-news-1">');
	          html.push('  <a class="item-link clearfix" href="'+url+'">');
	          html.push('      <div class="info-tag clearfix">');
	          html.push('          <span>'+k.Media+'</span>');
	          html.push('      '+this._getReadCount(k.ReadCount ,k.CommentCount));
	          html.push('      </div>');
	          html.push('      <div class="item-right-img">');
	          html.push('          <div class="info-left">');
	          html.push('            <h3 class="title">'+this._getTitle(k.Title)+'</h3>');
	          html.push('          </div>');
	          html.push('          <div class="img-right">');
	          html.push('              '+this._getImg(imgs[0]));
	          html.push('          </div>');
	          html.push('      </div>');
	          html.push('    </div>');
	          html.push('  </a>');
	          html.push('</section>');
	        }else if(imgs_len >= 3){
	          html.push('<section class="new-content item-news-3">');
	          html.push('  <a class="item-link clearfix " href="'+url+'">');
	          html.push('    <div class="info-tag">');
	          html.push('      <span>'+k.Media+'</span>');
	          html.push('      '+this._getReadCount(k.ReadCount ,k.CommentCount));
	          html.push('    </div>');
	          html.push('    <h3 class="title">'+k.Title+'</h3>');
	          html.push('    <div class="item-imgs-3 ">');
	          html.push('      <div>');
	          html.push('        '+this._getImg(imgs[0])+'</div>');
	          html.push('      <div>');
	          html.push('        '+this._getImg(imgs[1])+'</div>');
	          html.push('      <div>');
	          html.push('        '+this._getImg(imgs[2])+'</div>');
	          html.push('    </div>');
	          html.push('  </a>');
	          html.push('</section>');
	        }
	        return html.join('');
	    },
	    

	    _getVideoItem:function(k, i ,origin){
	        var html = [];
	        html.push('<section class="new-content item-video">');
	        html.push('  <a class="item-link clearfix" href="/'+k.NewsId+'?origin='+(origin?origin:'list')+'&n='+i+'&pageId='+k.PageId+'&PageIndex='+k.PageIndex+'">');
	        html.push('      <div class="info-tag clearfix">');
	        html.push('          <span>'+k.Media+'</span>');
	        html.push('      '+this._getReadCount(k.ReadCount ,k.CommentCount));
	        html.push('      </div>');
	        html.push('      <div class="item-right-img">');
	        html.push('          <div class="info-left">');
	        html.push('            <h3 class="title">'+this._getTitle(k.Title)+'</h3>');
	        html.push('          </div>');
	        html.push('          <div class="img-right">');
	        html.push('        '+this._getImg(k.ImageGuids[0]));
	        html.push('        <span class="play-ico"></span>');
	        html.push('          </div>');
	        html.push('      </div>');
	        html.push('    </div>');
	        html.push('  </a>');
	        html.push('</section>');
	        return html.join('');
	    }
	},

	// 日志接口
	logging : {
		// 调整显示和隐藏分类后，提交给后台的日志的接口
		adjustCategoryOrder : function(){
			// 从Session中取值
			var data = Store.get('_categoryList');
			if(data && data.length > 2){
		        var newData = [];
		        for(var i=0,len=data.length;i<len;i++){
		        	if(!data[i].noshow) newData.push(data[i]);
		        }
				Fetch.logger({
					"event_type": "AdjustCategoryOrder", 
				    "event_sub_type": "",
				    "event_value": newData.join(',')
				})
			}
		},

		// 分享后，需要请求的日志的接口
		share : function(type ,newsId){
			Fetch.logger({
				"event_type": "Share", 
			    "event_sub_type": type,	// "<分享目标>",
			    "event_value": newsId // "<NewsId>"
			})
		}
	},

	getCategory : function(resolve){
		var data = Store.get('_categoryList');
		if(data && data.length > 3){
	        var newData = [];
	        for(var i=0,len=data.length;i<len;i++){
	        	if(!data[i].noshow) newData.push(data[i]);
	        }
	        resolve({dataAll:data, data:newData});
		}else{
			// 排序
			var arrCompare = function(property){
	            return function(a,b){
	                var value1 = a[property];
	                var value2 = b[property];
	                return value1 - value2;
	            }
	        }

			Fetch.getData({module:'category'},function(data){
				var gambarId = '';

	            var categoryList = [];
	            var isInsertTrending = true;
	            if(window.lan == 'bx'){
	              categoryList = [
	                {"CategoryId":-1,"DefaultOrder":-1,"Name":"Recomendados","Type":"All","ForceAhead":false,"move":"false"}
	              ];
	            }else if(window.lan == 'yn'){
	              categoryList = [
	                {"CategoryId":-1,"DefaultOrder":-1,"Name":"Rekomendasi","Type":"All","ForceAhead":false,"move":"false"}
	              ];
	            }else if(window.lan == 'me'){
	              categoryList = [
	                {"CategoryId":-1,"DefaultOrder":-1,"Name":"اخترنا لك","Type":"All","ForceAhead":false,"move":"false"}
	              ];
	            }
	            for(var i=0,k,cl=data.length,kl,kn,kt;i<cl;i++){
	              k = data[i];
	              kn = k.Name;
	              kt = k.Type;
	              if(kn == 'Discovery'){
	                continue;
	              }

	              if(window.lan == 'me' && k.CategoryId == '9') {
	              	continue;
	              }

	              if(kt == 'Trending'){
		            	k.move = 'false';
		            	isInsertTrending = false;
		          }

	              if(kt == 'Video'){
	                if(kn == 'Rekomendasi' || kn == 'Recomendados'){
	                  k.DefaultOrder = 3;
	                  k.Name = 'Video';
	                  categoryList.push(k);
	                }
	              } else{
	                if(kt == 'Joke' || kt == 'FunnyPictures'){
	                  gambarId += ','+k.CategoryId;
	                }else{
	                  categoryList.push(k);
	                }
	              }
	            }
	            if(isInsertTrending && window.lan != 'me'){
	              if(window.lan == 'bx'){
	                categoryList.push({"CategoryId":0,"DefaultOrder":2,"Name":"Bombando","Type":"Trending","ForceAhead":false,"move":"false"});
	              }else{
	                categoryList.push({"CategoryId":0,"DefaultOrder":2,"Name":"Trending","Type":"Trending","ForceAhead":false,"move":"false"});
	              }
	            }
	            if(window.lan != 'me'){
	            	categoryList.push({"CategoryId":gambarId.substr(1),"DefaultOrder":4,"Name":"Humor","Type":"Joke","ForceAhead":false})
	            }
	            categoryList = categoryList.sort(arrCompare('DefaultOrder'));
				Store.set('_categoryList' ,categoryList ,60*60*24*2);
				Store.setSession('_categoryNow' ,categoryList[0]);
	            resolve({dataAll:categoryList ,data:categoryList});
			});
		}
	},


	getNewsList : function(cid ,resolve){
      Fetch.getData({module : 'newsList', param : { categoryId:cid ,ttl:new Date().getTime()} } ,function(e){
      	resolve(e.News ,e.Ads); 
      })
    },

    getSearchList : function(keyword ,type ,resolve){
    	console.log('keyword' ,keyword ,type);
    	Fetch.getData({module : 'search', param : { keyword:keyword ,type:type } } ,function(e){
    		console.log('getSearchList' ,e);
	      	resolve(e);
	    });
    },


    getJokeList : function(cid ,resolve){
    	if(cid.indexOf(',') > 0){
    		var jokeList = [];
	    	var cids = cid.indexOf(',') > 0 ? cid.split(',') : cid;
	    	Fetch.getData({module : 'newsList', param : { categoryId:cids[0] } } ,function(e1){
	      		if(e1.Count > 0){ jokeList = e1.News; }
	      		Fetch.getData({module : 'newsList', param : { categoryId:cids[1] } } ,function(e){
	      			if(e.Count > 0){
		                jokeList =jokeList.concat(e.News);
		            }
		      		resolve(jokeList ,e1.Ads); 
		      	})
	      	})
    	}else{
    		Fetch.getData({module : 'newsList', param : { categoryId:cid } } ,function(e){
	      		resolve(e.News ,e.Ads); 
	      	})
    	}
    },

    getTrendingList : function(cid ,resolve){
      Fetch.getData({module : 'trendingList'}  ,function(e){
      	if(e.Count <= 0){
	        resolve([]);
	        return;
	    }
	    var data = e.Trendings;
	    var newList = [];
	    for(var i=0,len=data.length;i<len;i++){
	      	if(data[i].CoverImage) newList.push(data[i]);
	    }
	    if(newList.length%2==1){
	      newList.push({TrendingId:'none'});
	    }
	    resolve(newList ,e.Ads);
      })
    },

    getTrendingInfoList : function(tid ,resolve){
      Fetch.getData({module : 'trendingInfo', urlKey: tid} ,function(e){
      	resolve(e.News ,e.Ads);
      })
    },


    getCommonList : function(nid ,resolve){
    	Fetch.getData({module : 'comment', urlKey : nid } ,resolve);
    },

    setLike : function (nid ,val) {
    	Fetch.getData({module : 'like', url : '/News/'+nid+'/like/'+val },function () {});
    }

}