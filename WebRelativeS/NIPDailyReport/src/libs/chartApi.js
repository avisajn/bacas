import Fetch from './fetch';
import Store from './store';
import Util from './chartUtil';
import moment from 'moment';

// start = 2017-10-20
// end = 2017-10-10
var getDateOldRange = function(start ,end){
	const str_sd = moment(start).format('YYYYMMDD');
	const str_ed = moment(end).format('YYYYMMDD') ;
	const d = parseInt((moment(end).valueOf() - moment(start).valueOf() ) / 1000 / 60 / 60 / 24);

	const str_old_sd = moment(start).subtract(d+1, 'days').format('YYYYMMDD');
	const str_old_ed = moment(start).subtract(1, 'days').format('YYYYMMDD');

	return {
		date : {
			start_date : str_sd , 
			end_date : moment(end).add(1, 'days').format('YYYYMMDD') 
		},
		dateOld : {
			start_date : str_old_sd , 
			end_date : str_sd
		},

		str : `solid line:${str_sd}~${str_ed} &&  dashed line:${str_old_sd}~${str_old_ed}` ,
		arr : [`solid line:${str_sd}~${str_ed}` ,`dashed line:${str_old_sd}~${str_old_ed}`]
	}
}


export default {
	user(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/user' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/user' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		}) 
	},

	news(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/news' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/news' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		});
	},


	newsCrawled(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/newsCrawled' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/newsCrawled' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		});
	},

	newsPushed(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/newsPushed' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/newsPushed' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		});
	},

	newsPushedNewClientChart(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/newsPushedNewClient' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/newsPushedNewClient' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		});
	},

	newsWithoutRelative(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/newsWithoutRelative' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/newsWithoutRelative' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		});
	},

	newsPushedNewUser(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/newsPushedNewUser' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/newsPushedNewUser' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		});
	},

	specialClickPosition(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/specialClickPosition' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/specialClickPosition' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.str });
		});
	},

	newsTypeCtr(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/newsTypeCtr' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/newsTypeCtr' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.arr });
		});
	},

	freshUsersCtr(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/freshUsersCtr' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/freshUsersCtr' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.arr });
		});
	},

	ctr(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/ctr' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/ctr' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.arr });
		});
	},

	newsCategoryCtr(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/newsCategoryCtr' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/newsCategoryCtr' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.arr });
		});
	},

	hotNewsCtr(start ,end){
		return new Promise(async function(r ,f){
			const date = getDateOldRange(start ,end);
			const data = await Fetch('/hotNewsCtr' ,{method : 'post' ,body:date.date });
			const oldData = await Fetch('/hotNewsCtr' ,{method : 'post' ,body:date.dateOld });
			r({data , oldData ,title : date.arr });
		});
	},


	crawlStatus(_day){
		const day = moment(_day).format('YYYYMMDD');
		return new Promise((r ,f) => {
			Fetch('/crawlStatus' ,{method : 'post' ,body:{
					start_date : day , 
					end_date : moment(_day).add(1, 'days').format('YYYYMMDD'),
					seconds : -1
				}
			}).then((k) => {
				const data = k[day];
				let doingsqueueData 	= [],
					pagequeueData 	= [],
					rssqueueData 	= [],


					videoimagequeueData = [],
					videorssqueueData 	= [],
					writedbnewsqueueData = [];

				let getTimeItem = function(k){
					let _time = null;
					for(let i in k){_time = i; }
					k = k[_time];
					return {
						time : moment(day + ' '+_time , "YYYYMMDD HH:mm:ss").toDate() ,
						doingsqueue : k.doingsqueue_length ,
						pagequeue : k.pagequeue_length,
						rssqueue : k.rssqueue_length,
						videoimagequeue : k.videoimagequeue_length,
						videorssqueue : k.videorssqueue_length,
						writedbnewsqueue : k.writedbnewsqueue_length
					}
				}

				let _t = null;
				data.map((k ,i) => {
					_t = getTimeItem(k);
					doingsqueueData.push([_t.time ,_t.doingsqueue]);
					pagequeueData.push([_t.time ,_t.pagequeue]);
					rssqueueData.push([_t.time ,_t.rssqueue]);
					videoimagequeueData.push([_t.time ,_t.videoimagequeue]);
					videorssqueueData.push([_t.time ,_t.videorssqueue]);
					writedbnewsqueueData.push([_t.time ,_t.writedbnewsqueue]);
				})
                
				r({
					doingsqueue : doingsqueueData,
					pagequeue : pagequeueData,
					rssqueue : rssqueueData,
					videoimagequeue : videoimagequeueData,
					videorssqueue : videorssqueueData,
					writedbnewsqueue : writedbnewsqueueData,
				});
			}, f);
		}) 
	},
	crawlStatusSeconds(_day ,od){
		const day = moment(_day).format('YYYYMMDD');
		return new Promise((r ,f) => {
			Fetch('/crawlStatus' ,{method : 'post' ,body:{
					start_date : day , 
					end_date : moment(_day).add(1, 'days').format('YYYYMMDD'),
					seconds : 1
				}
			}).then((k) => {
				console.log('crawlStatusSeconds:',k);
				const data = k[day];
				let doingsqueueData 	= od.doingsqueue,
					pagequeueData 	= od.pagequeue,
					rssqueueData 	= od.rssqueue,
					videoimagequeueData = od.videoimagequeue,
					videorssqueueData 	= od.videorssqueue,
					writedbnewsqueueData = od.writedbnewsqueue;

				let getTimeItem = function(k){
					let _time = null;
					for(let i in k){_time = i; }
					k = k[_time];
					return {
						time : moment(day + ' '+_time , "YYYYMMDD HH:mm:ss").toDate() ,
						doingsqueue : k.doingsqueue_length ,
						pagequeue : k.pagequeue_length,
						rssqueue : k.rssqueue_length,
						videoimagequeue : k.videoimagequeue_length,
						videorssqueue : k.videorssqueue_length,
						writedbnewsqueue : k.writedbnewsqueue_length
					}
				}

				let _t = null;
				data.map((k ,i) => {
					_t = getTimeItem(k);
					doingsqueueData.push([_t.time ,_t.doingsqueue]);
					pagequeueData.push([_t.time ,_t.pagequeue]);
					rssqueueData.push([_t.time ,_t.rssqueue]);
					videoimagequeueData.push([_t.time ,_t.videoimagequeue]);
					videorssqueueData.push([_t.time ,_t.videorssqueue]);
					writedbnewsqueueData.push([_t.time ,_t.writedbnewsqueue]);
				})
                
				r({
					doingsqueue : doingsqueueData,
					pagequeue : pagequeueData,
					rssqueue : rssqueueData,
					videoimagequeue : videoimagequeueData,
					videorssqueue : videorssqueueData,
					writedbnewsqueue : writedbnewsqueueData,
				});
			}, f);
		}) 
	},


	// 查询date的爬虫抓取率的图表数据
	crawlFrequency(_date ,type){
		const currentTime = moment().format("Hmmss");
		console.log('currentTime',currentTime);
	    // 得到纵坐标的一列
	    // dayTimes = [{"time": "0:00:00", "crawledNewsNum": 109 },...]
	    let fun_getSeriesItem = function(dayData){
	    	let d = [];
	    	dayData.data.map((k ,i) => { 
	    		if(k['crawledNewsNum'] == 0 && parseInt(k.time.replace(/:/g,"")) > currentTime){
	    			d.push('-'); 
	    		} else{d.push(k['crawledNewsNum']) }
	    	});
	    	return {
	    		name : dayData.date +'' ,
	    		type : 'line',
	    		data : d

	    	}
	    },
	    fun_getSeriesData = function(data){
	    	let d = [];
	    	let legendData = [];
	    	data.map((k) => {
	    		legendData.push(k.date+'');
	    		d.push(fun_getSeriesItem(k));
	    	})
	    	return {
	    		seriesData : d,
	    		legend : legendData
	    	};
	    },
	    // 得到一个数据
	    fun_getDataItem = function(_s ,_e){
	    	let param = {start_date : _s , end_date : _e, };
	    	if(type != -1) {param.news_type=type; }
			return new Promise((_r ,_f) => {
				Fetch('/crawlFrequency' ,{method : 'post' ,body:param}).then((k) => {      
					_r(k[0]);
				},(e) => {
					_r();
				});	
			})
		}

		return new Promise(async function(r ,f){
			const date = moment(_date).format('YYYYMMDD');
			let data = [];
			const lastweek = await fun_getDataItem(moment(_date).subtract(7, 'days').format('YYYYMMDD') ,moment(_date).subtract(6, 'days').format('YYYYMMDD'));
			lastweek && data.push(lastweek);
			const yesterday = await fun_getDataItem(moment(_date).subtract(1, 'days').format('YYYYMMDD') ,date);
			yesterday && data.push(yesterday);
			const today = await fun_getDataItem(date ,moment(_date).add(1, 'days').format('YYYYMMDD'));
			today && data.push(today);
		    const chartData = fun_getSeriesData(data);
			r({
			    tooltip : {trigger: 'axis'},
			    legend: {data:chartData.legend},
			    toolbox: {feature: {saveAsImage: {} } },
			    grid: {left: '5%', right: '5%', bottom: '5%', top:'5%', containLabel: true },
			    xAxis : [
			        {
			            type : 'category',
			            boundaryGap : false,
			            data : Util.getXAxis(data[0].data ,'time')
			        }
			    ],
			    yAxis : [{type : 'value'} ],
			    series : chartData.seriesData
			}) 
		}) ;
	},


	newsPushedNewClient(start ,end){
		return new Promise((r ,f) => {
			Fetch('/newsPushedNewClient' ,{method : 'post' ,body:{
					start_date : moment(start).format('YYYYMMDD') , 
					end_date : moment(end).add(1, 'days').format('YYYYMMDD') 
				}
			}).then((k) => {
				console.log('k:',k);
				const old = k;
				let newData = [];
				k.map((k) => {
					newData.push({pushReachRatio:parseFloat(k.pushReachRatio) ,pushRealCtr:parseFloat(k.pushRealCtr)});
				})
				r(Util.getLineOptions(newData ,start ,end ,{
					'pushReachRatio' : '推送到达率(%)',
					'pushRealCtr' : '到达点击率(%)',
				}));
			}, f);
		}) 
	},


};