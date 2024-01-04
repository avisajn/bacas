import Moment from 'moment';
import { extendMoment } from 'moment-range';
const moment = extendMoment(Moment);

let UtilLine = {
	getDateRangeArray(start ,end){
		const range = moment.range(start, end);
		let arr = [];
		for (let day of range.by('days')) {
			arr.push(day.format('YYYY-MM-DD'));
		}
		return arr;
	},
	getSeries(data ,key){
		let res = [];
		for(let i=0,len=data.length;i<len;i++){
			if(data[i][key] == 0){
				res.push('-');
			}else{
				res.push(data[i][key]);
			}
		}
		return res;
	},
	// 获取一个对象的key的集合
	getDataKeys(obj){
		let arr = [];
		for(let k in obj){
			arr.push(k);
		}
		return arr;
	},


	// 获取一个array<Object>的Object的[key]的集合
	getXAxis(list, key){
		let d = [];
    	list.map((k) => d.push(k[key]) );
    	return d;
	},

	// 输入：
	// {"travel": {"ctr": "1.156%", "fetchCount": 37376, "readCount": 432}, "Video-Film": {"ctr": "0.688%", "fetchCount": 20356, "readCount": 140}}
	// 
	// 返回：
	// {
	// 		ctr : [
	//		 	{name:'travel' ,value:'1.156%'},
	//		 	{name:'Video-Film' ,value:'0.688%'},
	//		],
	//		fetchCount : [
	//		 	{name:'travel' ,value:'37376'},
	//		 	{name:'Video-Film' ,value:'20356'},
	//		],
	//		readCount : [
	//		 	{name:'travel' ,value:'432'},
	//		 	{name:'Video-Film' ,value:'140'},
	//		],
	//		
	// }
	// 参数：
	// defaultRes = {
	//	 ctr : [],
	//	 fetchCount : [],
	//	 readCount : []
	// }
	// 
	getSeriesDataPie(data ,defaultRes){
		let item = null;
		for(let k in data){
			item = data[k];
			for(let j in item){
				defaultRes[j].push({name:k ,value:item[j]});
			}
		}
		return defaultRes;
		
	},

	getSeriesKeys(data, mapping){
		let arrLegend = [];
		let arrSeries = [];
		let getSeries = UtilLine.getSeries;
		for(let k in mapping){
			arrLegend.push(mapping[k]);
			arrSeries.push({
	            name : mapping[k],
	            type :'line',
	            data : getSeries(data ,k)
	        })
		}
		return {
			legend : arrLegend ,
			series : arrSeries
		};
	},
	getLineOptions(data ,start ,end ,mapping){
		let keyDatas = UtilLine.getSeriesKeys(data, mapping);
		return {
		    tooltip : {trigger: 'axis'},
		    legend: {data:keyDatas.legend },
		    toolbox: {feature: {saveAsImage: {} } },
		    grid: {left: '5%', right: '5%', bottom: '5%', top:'5%', containLabel: true },
		    xAxis : [
		        {
		            type : 'category',
		            boundaryGap : false,
		            data : UtilLine.getDateRangeArray(start ,end)
		        }
		    ],
		    yAxis : [{type : 'value'} ],
		    series : keyDatas.series
		}
	},


	// data : [ 
	// 			{ key:'activeUser'      , text: '活跃用户'      , color:'#c64541'},
	//          { key:'readNewsUser'    , text: '读新闻用户'    , color:''},
	//          { key:'freshUser'       , text: '新用户'       , color:''},
	//        ]
	// arr_checked : ['activeUser' ,'readNewsUser']
	// return [ 
	// 			{ key:'activeUser'      , text: '活跃用户'      , color:'#c64541'},
	//          { key:'readNewsUser'    , text: '读新闻用户'    , color:''},
	//        ]
	getArrayByChecked(arr_checked ,all){
		let res = [];
		all.map((k) => {
			arr_checked.map((j) => {
				if(k.key == j){ res.push(k); }
			});
		});
		return res;
	},

	// 获取一个arr的key的值
	// arr : [ 
	// 			{ key:'activeUser'      , text: '活跃用户'      , color:'#c64541'},
	//          { key:'readNewsUser'    , text: '读新闻用户'    , color:''},
	//          { key:'freshUser'       , text: '新用户'       , color:''},
	//        ]
	// keyName : 'text';
	// return ['活跃用户' ,'读新闻用户' ,'新用户']
	getArrKey(arr ,keyName){
		let res = [];
		arr.map((k) => {
			res.push(k[keyName]);
		});

		return res;
	},


// 	const lineStyleColor = [	// 颜色可选方案
// 	{d:{lineStyle:{normal:{color:'#9dccb6'}}}  ,o:{lineStyle:{normal:{color:'#aed4c2',type:'dashed'}}}},
// 	{d:{lineStyle:{normal:{color:'#D24D57'}}}  ,o:{lineStyle:{normal:{color:'#EC644B',type:'dashed'}}}},
// 	{d:{lineStyle:{normal:{color:'#9dccb6'}}}  ,o:{lineStyle:{normal:{color:'#aed4c2',type:'dashed'}}}},
// 	{d:{lineStyle:{normal:{color:'#9dccb6'}}}  ,o:{lineStyle:{normal:{color:'#aed4c2',type:'dashed'}}}},
// 	{d:{lineStyle:{normal:{color:'#9dccb6'}}}  ,o:{lineStyle:{normal:{color:'#aed4c2',type:'dashed'}}}},
// 	{d:{lineStyle:{normal:{color:'#9dccb6'}}}  ,o:{lineStyle:{normal:{color:'#aed4c2',type:'dashed'}}}},
// 	{d:{lineStyle:{normal:{color:'#9dccb6'}}}  ,o:{lineStyle:{normal:{color:'#aed4c2',type:'dashed'}}}},
// ]

	// 根据显示的列，返回列的数据
	// data = [{"loginUser": 21219, "commentUser": 1351, "totalComments": 3266, "loginRation": "6.892%", "activeUser": 307883, "readNewsUser": 269241, "freshUser": 26213}, 
	// {"loginUser": 20639, "commentUser": 1340, "totalComments": 3100, "loginRation": "6.805%", "activeUser": 303281, "readNewsUser": 262777, "freshUser": 28309}, 
	// {"loginUser": 20645, "commentUser": 1253, "totalComments": 2719, "loginRation": "6.890%", "activeUser": 299653, "readNewsUser": 259441, "freshUser": 27281}, 
	// {"loginUser": 20061, "commentUser": 1277, "totalComments": 3199, "loginRation": "6.965%", "activeUser": 288042, "readNewsUser": 248723, "freshUser": 24133}, 
	// {"loginUser": 21625, "commentUser": 1414, "totalComments": 3452, "loginRation": "7.032%", "activeUser": 307521, "readNewsUser": 267798, "freshUser": 33259}, 
	// {"loginUser": 22098, "commentUser": 1372, "totalComments": 3688, "loginRation": "6.969%", "activeUser": 317101, "readNewsUser": 275063, "freshUser": 33945}, 
	// {"loginUser": 22171, "commentUser": 1512, "totalComments": 4002, "loginRation": "7.077%", "activeUser": 313273, "readNewsUser": 269916, "freshUser": 28541}]
	// 
	// 
	// oldData = [{"loginUser": 14883, "commentUser": 1633, "totalComments": 4220, "loginRation": "4.447%", "activeUser": 334710, "readNewsUser": 293273, "freshUser": 36000}, 
	// {"loginUser": 14628, "commentUser": 1465, "totalComments": 3288, "loginRation": "4.419%", "activeUser": 331027, "readNewsUser": 289675, "freshUser": 31876}, 
	// {"loginUser": 13748, "commentUser": 1458, "totalComments": 3570, "loginRation": "4.424%", "activeUser": 310747, "readNewsUser": 270440, "freshUser": 25206}, 
	// {"loginUser": 13395, "commentUser": 1355, "totalComments": 3254, "loginRation": "4.363%", "activeUser": 306980, "readNewsUser": 254679, "freshUser": 28192}, 
	// {"loginUser": 13239, "commentUser": 1210, "totalComments": 3119, "loginRation": "4.411%", "activeUser": 300117, "readNewsUser": 260218, "freshUser": 25347}, 
	// {"loginUser": 13862, "commentUser": 1477, "totalComments": 4037, "loginRation": "4.472%", "activeUser": 309977, "readNewsUser": 270732, "freshUser": 22907}, 
	// {"loginUser": 14816, "commentUser": 1474, "totalComments": 3579, "loginRation": "4.667%", "activeUser": 317483, "readNewsUser": 278151, "freshUser": 29300}]
	// 
	// mapping=[{ key:'activeUser'      , text: '活跃用户'      , color:'#c64541'},
    //         { key:'readNewsUser'    , text: '读新闻用户'    , color:''},
    //         { key:'freshUser'       , text: '新用户'       , color:''}]
	// 
	// return=[	{"name": "活跃用户", "type": "line", "data": [307883, 303281, 299653, 288042, 307521, 317101, 313273 ] },
	// 			{"name": "活跃用户(比对)", "type": "line", "data": [307883, 303281, 299653, 288042, 307521, 317101, 313273 ],lineStyle:{normal:{color:'#aed4c2',type:'dashed'}} },
	//     		{"name": "读新闻用户", "type": "line", "data": [269241, 262777, 259441, 248723, 267798, 275063, 269916 ] },
	//     		{"name": "读新闻用户(比对)", "type": "line", "data": [269241, 262777, 259441, 248723, 267798, 275063, 269916 ],lineStyle:{normal:{color:'#aed4c2',type:'dashed'}} },
	//     		{"name": "新用户", "type": "line", "data": [26213, 28309, 27281, 24133, 33259, 33945, 28541 ] },
	//     		{"name": "新用户(比对)", "type": "line", "data": [26213, 28309, 27281, 24133, 33259, 33945, 28541 ],lineStyle:{normal:{color:'#aed4c2',type:'dashed'}} },
	// 		]
	// 
	getArrByKeyMapping(data ,oldData ,mapping ,comparison=true){
		let res = [];
		let _mp = {};
		mapping.map((j) => {
			_mp[j.key] = []; 
			_mp['_'+j.key] = [];
		})
		
		let _v = null;
		let i = null;
		data.map((k ,index) => {
			mapping.map((j) => {
				i = j.key;
				_v = parseFloat(k[i]);
				var _true = i == 'pushReachRatio' || i=='pushRealCtr';
				if(_true && _v > 0) { //等于推送到达率或者达到点击率的时候，值*100
					_v *= 100;
				}
				_mp[i].push(_v || '-'); 
				if(comparison){
					_v = oldData[index];
					if(_v && _v[i]){
						_v = parseFloat(_v[i]);
						if(_v >0 && _true) _v *= 100;
						_mp['_'+i].push(_v); 
					}else{
						_mp['_'+i].push('-');
					}
				}
			})
		})

		mapping.map((j) => {
			i = j.key;
			console.log('j.text:' ,j.text)
			if(j.text == '推送到达率' || j.text == '到达点击率'){
				console.log('_mp:::',_mp);
			}
			res.push({"name": j.text, "type": "line", "data": _mp[i] ,lineStyle:{normal:{color:j.color}}  });
			if(comparison){
				res.push({"name": j.text+'(比对)', "type": "line", "data": _mp['_'+i] ,lineStyle:{normal:{color:j.color ,type:'dashed'}}  });
			}
		})
		return res;
	},


	// 返回给前台一个下拉选择列表
	getColumnMapping(obj){
		let arr = [];
		let first = null;
		let i=0;
		for(let k in obj){
			if(i == 0){
				first = k;
			}
			arr.push({key:k, text:k ,t:k.replace(/-|:/gi,'').toLocaleLowerCase()});
			i++;
		}
		arr = arr.sort(function(a ,b){
			return a.t.localeCompare(b.t);
		});

		return {
			columnMapping : arr ,
			first : first
		};
	},

	getArrByKeyName(data ,oldData ,keyName){
		let _data = [];
		let _oldData = [];

		data.map((k) => {_data.push(k[keyName] || {}); });
		oldData.map((k) => {_oldData.push(k[keyName] || {}); });
		return {_data , _oldData };
	},

	// {"BACKUP_HOT": 21219, "COMPOSITE": 1351, "totalComments": 3266, "loginRation": "6.892%", "activeUser": 307883, "readNewsUser": 269241, "freshUser": 26213}
	getArrByKeyNames(data ,oldData ,columnNames ,key){
		let _data = [];
		let _oldData = [];
		// console.log('columnNames:' ,columnNames ,key);
		// console.log('data:' ,data);
		// console.log('oldData:' ,oldData);
		let _temp = {};
		data.map((k) => {
			_temp = {};
			columnNames.map((j) => {
				if(k[j]){
					_temp[j] = k[j][key]; 
				}
			})
			_data.push(_temp);
		});
		oldData.map((k) => {
			_temp = {};
			columnNames.map((j) => {
				if(k[j]){
					_temp[j] = k[j][key]; 
				}
			})
			_oldData.push(_temp);
		});
		// oldData.map((k) => {_oldData.push(k[keyName] || {}); });
		return {_data , _oldData };
	}

	// getColumnValueByKey(data ,)


}



export default UtilLine;