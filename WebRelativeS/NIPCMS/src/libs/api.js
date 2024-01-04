import Fetch from './fetch';
import Store from './store';
import Util from './util';
import moment from 'moment';

export default {
	// 
	
	news : {
		queryNews(param){
			return Fetch('/queryNews' ,{method : 'get' ,body:param});
		},
		deleteNews(idsArr){
			return Fetch('/removeNews?delete_by=news_id_list&value='+idsArr.join(','), {method: 'delete'});
		}
	},



	activity : {
		mother : {
			getList(){
				return Fetch('http://brcrawler.vm.newsinpalm.net/magicadapi/activity/motherquestion/get' ,{method : 'get'});
			}
		},

		iftar2(){
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/iftar2/get' ,{method : 'get'});
		},
	},

	film : {
		setprize(param){
			// param = {uid:user_id ,pnm:prize_name}
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/setprize' ,{method : 'post',body:param});
		},

		queryprize(date){
			// date='2017-08-07';
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/queryprize' ,{method : 'get',body:{date:date}}).then((data) => {
				data.map((k) => {
					k.time = moment(k.time).format('MM-DD HH:mm:ss');
				});
				return data;
			});
		},
		queryuser(date){
			// date=mmdd;
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/queryuser' ,{method : 'get',body:{date:date}});
			// return Fetch('http://localhost:8360/activity/fm/queryuser' ,{method : 'get',body:{date:date}});
		},
	},
	film_export : {
		alluser(){
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/queryall' ,{method : 'get'});
		},
		standingalluser(){
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/queryallstanding' ,{method : 'get'});
		},

	},


	girl : {
		setprize(param){
			// param = {uid:user_id ,pnm:prize_name}
			// return Fetch('http://localhost:8360/activity/fm/setprize' ,{method : 'post',body:param});
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/setprize' ,{method : 'post',body:param});
		},

		remove(ids){
			// param = {uid:user_id ,pnm:prize_name}
			// return Fetch('http://localhost:8360/activity/fm/remove' ,{method : 'post',body:{ids:ids}});
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/remove' ,{method : 'post',body:{ids:ids}});
		},

		queryprize(){
			// date='2017-08-07';
			// return Fetch('http://localhost:8360/activity/fm/queryprize' ,{method : 'get'}).then((data) => {
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/queryprize' ,{method : 'get'}).then((data) => {
				
				return data;
			});
		},
		queryuser(){
			// date=mmdd;
			// return Fetch('http://localhost:8360/activity/fm/queryuser' ,{method : 'get'});
			return Fetch('http://idcrawler.vm.newsinpalm.net/magicadapi/activity/fm/queryuser' ,{method : 'get'});
		},
	},






	getPermission(){
		return Fetch('http://idcrawler.vm.newsinpalm.net/permission/api/p?sysid=4' ,{method : 'post' ,withCredentials:true});
	},



};