var fs = require('fs');
const tracer = require('tracer');
// const path = require('path')
// const logSqlFile = fs.createWriteStream("./sql.log", {flags: "a", encoding: "utf8" });
// const path = path.resolve(__dirname, './server/views')
const baseUrl = __dirname+'/';
Date.prototype.Format = function(fmt){
  var o = {   
    "M+" : this.getMonth()+1,                 //月份   
    "d+" : this.getDate(),                    //日   
    "h+" : this.getHours(),                   //小时   
    "m+" : this.getMinutes(),                 //分   
    "s+" : this.getSeconds(),                 //秒   
    "q+" : Math.floor((this.getMonth()+3)/3), //季度   
    "S"  : this.getMilliseconds()             //毫秒   
  };   
  if(/(y+)/.test(fmt))   
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));   
  for(var k in o)   
    if(new RegExp("("+ k +")").test(fmt))   
  fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));   
  return fmt;   
}

var logger = tracer.console({
    transport : function(data) {

    	console.log('<LOG> ',JSON.stringify(data.output));
        if(data.title == 'error'){	// 只记录错误日志
        	var today = (new Date()).Format("yyyy-MM-dd");
        	// console.log('today:' ,today);
        	fs.createWriteStream(baseUrl+today+"-err.log", {flags: "a", encoding: "utf8" }).write(data.output+"\n");
        }
    }
});

exports.debug = function(msg){logger.debug(msg); }
exports.error = function(msg){logger.error(msg); }
exports.log = function(msg){logger.log(msg); }