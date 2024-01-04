import Fetch from './fetch';
import Store from './store';
import Util from './util';
import moment from 'moment';

let getParam = function(day){
	return {
		start_date : moment(day).subtract(1, 'days').format('YYYYMMDD') , 
		end_date : moment(day).add(1, 'days').format('YYYYMMDD') 
	}
}

const getJSONBaseUrl = function () {
	if(window.location.href.indexOf('localhost') >= 0) return 'http://localhost:8360/magicad/json';
	else return 'http://idcrawler.vm.newsinpalm.net/magicadapi/magicad/json';
}

export default {
	inFeedBanner : {
		getTrendingList(startDate ,endDate ,country){
			let url = 'http://brcrawler.vm.newsinpalm.net/api/trendingnews/get_history_topic_list/';
			if(country == 'id'){
				url = 'http://idcrawler.vm.newsinpalm.net/api/trendingnews/get_history_topic_list/';
			}
			// 默认查询 明天 至 明天-8天 的所有online的数据
			return new Promise((r ,f) => {
				Fetch(url ,{
					method : 'post' ,
					withCredentials : false,
					body:JSON.stringify({
						"page":{"isTrusted":true},
						"start_date":moment(startDate).format('YYYY-MM-DD'),
						"end_date":moment(endDate).format('YYYY-MM-DD'),
					})
				}).then((k) => {
					if(k.status != 'ok'){f(); return; }
					let d = [];
					k.trending_topic_list.map((k) => {if(k.status == 1){d.push(k); } }) 
					r(d);
				},(e) => {
					f(e);
				});
			})
		},

		getChartList(){
			return Fetch('/bannerCtr' ,{method:'get'});
		}
	},

	json : {
		getlist (containerName) {
			return Fetch(getJSONBaseUrl()+'/get?cname='+(containerName+''),{method:'get'});
		},

		getContent(name ,containerName) {
			return Fetch(getJSONBaseUrl()+'/getjson?name='+name+'&cname='+(containerName+''),{method:'get'}).then((k) => {
				const objData = k.AdUnitDetails;
				if(!objData) return k;
				const newDataList = [];
				let _data =  null;
				for(let item in objData){
					objData[item].map((k) => {
						if(!_data) _data = k;
						k['Type'] = item;
						k.i = k.AdPlacementId+'-'+(Math.random()*10000);
						newDataList.push(k);
					});
				}
				const columnMapping = [];
				for(let item in _data){
					if(item != 'i') columnMapping.push(item);
				}
				k.ColumnMapping = columnMapping;
				k.AdUnitDetails = newDataList;
				return k;
			});
		},
		submitContent(obj ,name ,containerName){
			return Fetch(getJSONBaseUrl()+'/submitcontent',{method:'post',body:{'k':JSON.stringify(obj),name:name ,cname:(containerName+'')}});	
		},
		creageJsonFile(param){
			return Fetch(getJSONBaseUrl()+'/createjson',{method:'post',body:param});
		}
	},


	searchPush : {
		newsTitleSearch(param ){
			return Fetch('/newsTitleSearch' ,{method:'get' ,body:param });
		},

		pushNews(type ,param){
			if(type == 1){
				return Fetch('/newspusher/pushsingle' ,{method:'post' ,body:param });
			}else{
				return Fetch('/newspusher/pushlist' ,{method:'post' ,body:param });
			}
		},

		promote(param){
			return Fetch('/newspusher/promoteToNews' ,{method:'post' ,body:param });
		}

	},

	advertorial : {
		getNewsList(param ,country){
			let baseUrl = null;
			if(country == 'id'){	// 选择的是印尼
				baseUrl = 'http://indonesiabackendnewsapi.azurewebsites.net';
			}else{
				baseUrl = 'http://back.cennoticias.com';
			}
			return Fetch(baseUrl+'/api/v1/advertorial' ,{method:'get' ,body:param ,withCredentials:false ,allData:true});
		},

		submit(param ,country){
			let baseUrl = null;
			if(country == 'id'){	// 选择的是印尼
				baseUrl = 'http://indonesiabackendnewsapi.azurewebsites.net';
			}else{
				baseUrl = 'http://back.cennoticias.com';
			}
			return Fetch(baseUrl+'/api/v1/advertorial' ,{method:'post' ,body:param ,withCredentials:false ,allData:true});
		},
	},




	dynamicBanner(param ,country){
		let baseUrl = null;
		if(country == 'id'){	// 选择的是印尼
			baseUrl = 'http://indonesiabackendnewsapi.azurewebsites.net';
		}else{
			baseUrl = 'http://brazilbackendapi.azurewebsites.net';
		}
		return Fetch(baseUrl+'/api/v1/DynamicBanner' ,{method:'post' ,withCredentials:false ,body:param ,attach:true});
	},

	updDynamicBanner(param ,country){
		let baseUrl = null;
		if(country == 'id'){	// 选择的是印尼
			baseUrl = 'http://indonesiabackendnewsapi.azurewebsites.net';
		}else{
			baseUrl = 'http://brazilbackendapi.azurewebsites.net';
		}
		return Fetch(baseUrl+'/api/v1/DynamicBanner/update' ,{method:'post' ,withCredentials:false ,body:param ,attach:false});
	},
	delDynamicBanner(pageId ,country){
		let baseUrl = null;
		if(country == 'id'){	// 选择的是印尼
			baseUrl = 'http://indonesiabackendnewsapi.azurewebsites.net';
		}else{
			baseUrl = 'http://brazilbackendapi.azurewebsites.net';
		}
		return Fetch(baseUrl+'/api/v1/DynamicBanner/'+pageId ,{method:'delete' ,withCredentials:false ,attach:true});
	},

	dynamicBannerHistory(param ,country){
		let baseUrl = null;
		if(country == 'id'){	// 选择的是印尼
			baseUrl = 'http://indonesiabackendnewsapi.azurewebsites.net';
		}else{
			baseUrl = 'http://brazilbackendapi.azurewebsites.net';
		}
		return Fetch(baseUrl+'/api/v1/DynamicBanner' ,{method:'get' ,withCredentials:false ,body:param });
	},
	getTrendingHistory(){
		return Fetch('http://idcrawler.vm.newsinpalm.net/permission/api/trending' ,{method:'get'});	
	},

	getTrendingNewId(newsId){
		return Fetch('http://idcrawler.vm.newsinpalm.net/permission/api/trending/'+newsId ,{method:'get'});	
	},



	


	getPermission(){
		return Fetch('http://idcrawler.vm.newsinpalm.net/permission/api/p?sysid=1' ,{method : 'post' ,withCredentials:true});
	},

	getLatestDate(){
		return Fetch('/latestDate' ,{method:'post'});
	},


	user(day){
		return new Promise((r ,f) => {
			Fetch('/user' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},


	news(day){
		return new Promise((r ,f) => {
			Fetch('/news' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	newsWithoutRelative(day){
		return new Promise((r ,f) => {
			Fetch('/newsWithoutRelative' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	newsCrawled(day){
		return new Promise((r ,f) => {
			Fetch('/newsCrawled' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	newsPushed(day){
		return new Promise((r ,f) => {
			Fetch('/newsPushed' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	newsPushedNewClient(day){
		return new Promise((r ,f) => {
			Fetch('/newsPushedNewClient' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	newsPushedNewUser(day){
		return new Promise((r ,f) => {
			Fetch('/newsPushedNewUser' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	specialClickPosition(day){
		return new Promise((r ,f) => {
			Fetch('/specialClickPosition' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	newsReadDuration(day){
		return new Promise((r ,f) => {
			Fetch('/newsReadDuration' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRow(k));
			},(e) => {
				f(e);
			});
		}) 
	},


	newsTypeCtr(day){
		return new Promise((r ,f) => {
			Fetch('/newsTypeCtr' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRowList(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	// 点击率统计
	ctr(day){
		return new Promise((r ,f) => {
			Fetch('/ctr' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRowList(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	//新用户点击率统计
	freshUsersCtr(day){
		return new Promise((r ,f) => {
			Fetch('/freshUsersCtr' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRowList(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	//热门新闻点击率统计
	hotNewsCtr(day){
		return new Promise((r ,f) => {
			Fetch('/hotNewsCtr' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRowList(k));
			},(e) => {
				f(e);
			});
		}) 
	},

	//类别点击率统计
	newsCategoryCtr(day){
		return new Promise((r ,f) => {
			Fetch('/newsCategoryCtr' ,{method : 'post' ,body:getParam(day)}).then((k) => {
				r(Util.getArrayRowList(k));
			},(e) => {
				f(e);
			});
		}) 
	},


	// 用户数据统计－表格
	userBaseDataQuery(param){
		return Fetch('/baseDataQuery' ,{method : 'post' ,body:param});
	},

	// 
	keywordSearchCountDesc(param){
		return Fetch('/keywordSearchCountDesc' ,{method : 'post' ,body:param});
	}



};