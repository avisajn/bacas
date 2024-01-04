/**
 * Created by aresn on 16/6/20.
 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import App from 'components/app.vue';
import Routers from './router';
import Env from './config/env';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import API from './libs/api';
import Store from './libs/store';
import locale from 'iview/src/locale/lang/en-US';

import moment from 'moment';
let lastDate = moment(new Date()).subtract(1, 'days').format('YYYY-MM-DD');
window.lastDate = lastDate;	// 默认为： 天数－1
window.lastTime = new Date(lastDate).getTime();
window.startDay = moment(lastDate).subtract(7, 'days').format('YYYY-MM-DD');
window.earlyDay = new Date('2016-10-20').valueOf();	// 之前的数据，都没有

window.config = {
	width : document.body.clientWidth - 240 - 40,
	height : document.body.clientHeight -50 - 53 - 100
}

Vue.use(VueRouter);
Vue.use(iView, { locale });

// 开启debug模式
Vue.config.debug = true;


let start = function(){
	// 路由配置
	let router = new VueRouter({
	    // 是否开启History模式的路由,默认开发环境开启,生产环境不开启。如果生产环境的服务端没有进行相关配置,请慎用
	    // history: Env != 'production'
	    history: false
	});

	router.map(Routers.getRouter());

	router.beforeEach(() => {
	    window.scrollTo(0, 0);
	});

	router.afterEach(() => {

	});

		
	router.start(App, '#app');
}

window.toLink = function(url){
    window.Loading.show();
    window.location.href = '#'+url;
}


let getLang = function(country){
	if(!country) return null;
	if(country.indexOf(',') > 0){
		return country.split(',')[0];
	}else{
		return country;
	}
}

window.Loading = {
    dom : document.getElementById('myLoading'),
    show : function(){this.dom.style.visibility = 'visible'; },
    hide : function(){this.dom.style.visibility = 'hidden'; }
}

const _p = Store.getSession('_p');
const defaultLanguage = Store.get('language');
if(_p && _p.over && _p.country && defaultLanguage){
	window.permission = _p.permission;
	window.country = _p.country;
	window.lan = defaultLanguage;
	window.username = _p.username;
	console.log(window);
	window.Loading.hide();
	start();
}else{
	API.getPermission().then((data) => {
		if(data.errno == -98){	// 已过期
			alert('登录信息已经过期了，请重新登录！');
			return;
		}
		const list = data.list;
		const country = data.country;
		let res = {};
		list.map((k) => {res[k.key] = k.type; });
		window.country = country;
		window.permission = res;
		window.username = data.username;
		const _selectCountry = getLang(country);
		Store.set('language' ,_selectCountry);
		window.lan = _selectCountry;
		Store.setSession('_p' ,{
			permission : res ,
			over : true ,
			country : country ,
			name : data.username
		});
		window.Loading.hide();
		start();
	})	
}