var Util = {
	getQuery(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		const hash = window.location.hash.split('?');
		if(hash && hash.length == 2){
	        var r = window.location.hash.split('?')[1].match(reg);
	        if(r!=null)return  unescape(r[2]); return null;
		}else{
			return null;
		}
	},

	// 得到保留两位小数的结果
	getFixed(v){
		let fixNum = new Number(v+1).toFixed(2);//四舍五入之前加1  
		return new Number(fixNum - 1).toFixed(2);
	},


	// 得到两个数据的百分比
	getPrecent(vtoday ,vyes){
		if(vyes == 0) return Util.getFixed(vtoday*100);
		let d = parseFloat((vtoday-vyes)/vyes*100);
		if(d){return Util.getFixed(d); }else{return 0; }
	},


	// 判断Name是否在list中
	dashTypeVisibile(list ,name){
        for(var i=0,len=list.length;i<len;i++){ if(list[i] == name) return true; }
        return false;
	},

	// 如果传的值为正的，则返回上箭头的html，或下箭头的html，或者==
	getArrow(v){ 
		if(v > 0){return '<span style="color:red;"><i class="ivu-icon ivu-icon-arrow-up-c"></i> '+v+' % </span>'; }
		if(v < 0){return '<span style="color:green;"><i class="ivu-icon ivu-icon-arrow-down-c"></i> '+v+' % </span>'; }
		if(v == 0){return ' == '; }
	},

	// 专门为首页，列表使用
	// 功能： 根据两行的数据，讲两行的数据合并一行，显示出增长和下跌率
	// 仅要返回一条数据时，可以使用此方法
	// 例如：
	// data : [
	// 	{"activeUser": 263885, "readNewsUser": 228805, "freshUser": 28430, "loginUser": 12322, "commentUser": 853, "totalComments": 1989, "loginRation": "4.669%"}, 
	// 	{"commentUser": 794, "totalComments": 1932, "activeUser": 273647, "readNewsUser": 237559, "freshUser": 32027, "loginUser": 12678, "loginRation": "4.633%"}
	// ];
	// 返回：[{
	// 	{
	// 		"activeUser": "263885", "_activeUser" : "-1",
	// 		"readNewsUser": 228805, "_readNewsUser" : "-1",
	// 		"freshUser": 28430, "_freshUser" : "-1",
	// 		"loginUser": 12322, "_loginUser" : "-1",
	// 		"commentUser": 853, "_commentUser" : "-1",
	// 		"totalComments": 1989, "_totalComments" : "-1",
	// 		"loginRation": "4.669%""_loginRation" : "-1",
	// 	}, 
	// }]
	getArrayRow(data){
		if(data.length != 2){
			console.error('getStatisticRow:数据有误',data);
			return [];
		}
		let resData = this.getPrecentObject(data[1], data[0]);
		for(let k in resData){
			resData[k] = resData[k] + ' ( '+resData['_'+k] +' ) ';
		}
		return [resData];
	},


	// 传入两个对象，返回new对象和old的对象的百分比值
	getPrecentObject(_new ,_old){
		if(typeof(_old) == 'undefined'){
			return _new;
		}
		let _v1 ,_v2 ,_v;
		let getArrow = Util.getArrow;
		let getPrecent = Util.getPrecent;
		for(let k in _new){
			_v1 = _old[k];
			_v2 = _new[k];
			if(typeof(_v1) == 'string'){
				_v1 = parseFloat(_v1);
				_v2 = parseFloat(_v2);
			}
			_new['_'+k] = getArrow(getPrecent(_v2 ,_v1));
		}
		return _new;
	},


	// 专门为首页使用，返回一个列表
	// 输入：第一个元素为昨天的数据，第二个元素为今天的数据
	// [
	//     {
	//         "Gallery": {"newsTypeRead": 1962, "newsTypeFetch": 30234, "ctr": "6.489383%"},
	//         "Joke": {"newsTypeRead": 7337, "newsTypeFetch": 112806, "ctr": "6.504087%"},
	//         "Video": {"newsTypeRead": 36632, "newsTypeFetch": 830643, "ctr": "4.410077%"},
	//         "FunnyPictures": {"newsTypeRead": 3905, "newsTypeFetch": 684763, "ctr": "0.570270%"},
	//         "Forum": {"newsTypeRead": 0, "newsTypeFetch": 155, "ctr": "0.000000%"},
	//         "News": {"newsTypeRead": 3695735, "newsTypeFetch": 31088401, "ctr": "11.887826%"},
	//         "Blog": {"newsTypeRead": 0, "newsTypeFetch": 4, "ctr": "0.000000%"}
	//     },
	//     {
	//         "Video": {"newsTypeRead": 36535, "newsTypeFetch": 890282, "ctr": "4.103756%"},
	//         "News": {"newsTypeRead": 3402999, "newsTypeFetch": 29877106, "ctr": "11.389989%"},
	//         "Forum": {"newsTypeRead": 0, "newsTypeFetch": 41, "ctr": "0.000000%"},
	//         "Gallery": {"newsTypeRead": 1283, "newsTypeFetch": 19540, "ctr": "6.566018%"},
	//         "Blog": {"newsTypeRead": 0, "newsTypeFetch": 2, "ctr": "0.000000%"},
	//         "Joke": {"newsTypeRead": 5283, "newsTypeFetch": 95827, "ctr": "5.513060%"},
	//         "FunnyPictures": {"newsTypeRead": 3867, "newsTypeFetch": 690588, "ctr": "0.559958%"}
	//     }
	// ]
	// 
	// 返回：
	// 今天的数据和相对于昨天的数据的增长率，按照类型
	getArrayRowList(data){
		if(data.length != 2){
			console.error('getStatisticRow:数据有误',data);
			return [];
		}
		let r1 = data[0] ,r2 = data[1] , _v;
		let resList = [] ,resItem=null;
		let getFixed = this.getFixed ,
			getPrecentObject = this.getPrecentObject;

		for(let k in r2){
			resItem = getPrecentObject(r2[k] ,r1[k])
			for(let j in r2[k]){
				_v = resItem[j];
				if((_v+"").indexOf('%') > 0){
					_v = getFixed(parseFloat(_v))+'%';
				}
				resItem[j] = _v ;
				_v = resItem['_'+j];
				resItem[j] = resItem[j] + ' '+(_v?'( '+_v+' )':'');

			}
			resItem['_name'] = k;
			resList.push(resItem);
		}
		return resList;
	}
}




export default Util;