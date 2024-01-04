import Vue from 'vue';
import VueRouter from 'vue-router';
import App from 'components/app.vue';
import Routers from './router';
import Env from './config/env';
import iView from 'iview';
import 'iview/dist/styles/iview.css';
import API from './libs/api';
import Store from './libs/store';
import {decryptCode ,encryptCode} from './libs/des';
import Cookies from 'js-cookie';
import moment from 'moment';

if(window.location.href.indexOf(':8080') > 0){
    window.ENV = 'prod';
}else{
    window.ENV = 'dev';
}


let lastDate = moment(new Date()).format('YYYY-MM-DD');
window.lastDate = lastDate; // 默认为： 天数－1
window.startDay = moment(lastDate).subtract(7, 'days').format('YYYY-MM-DD');

Vue.use(VueRouter);
Vue.use(iView);

// 开启debug模式
Vue.config.debug = true;

// 路由配置
let router = new VueRouter({history: false });



let start  = function(){

    // 如果是第一次设置密码，必须得通过url中的token来判断用户信息

    router.map(Routers.getRouter());
    router.beforeEach(() => {
        window.scrollTo(0, 0);
    });

    router.afterEach(() => {});
    router.redirect({'*': "/"});
    router.start(App, '#app');  
}

window.ciphertext = 'bacanews';
let token = Cookies.get('hadoop_token');
window.Loading.hide();
if(token){
	window.logined = true;
    window.userData = decryptCode(token);
    start();
}else{
	window.logined = false;
	start();
}

