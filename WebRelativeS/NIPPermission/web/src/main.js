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
import Util from './libs/util';
import {decryptCode ,encryptCode} from './libs/des';
import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';


if(window.location.href.indexOf(':8080') > 0){
    window.ENV = 'prod';
}else{
    window.ENV = 'dev';
}

Vue.use(VueRouter);
Vue.use(iView);

// 开启debug模式
Vue.config.debug = true;

// 路由配置
let router = new VueRouter({
    // 是否开启History模式的路由,默认开发环境开启,生产环境不开启。如果生产环境的服务端没有进行相关配置,请慎用
    // history: Env != 'production'
    history: false
});


let start  = function(){
    router.map(Routers.getRouter());
    router.beforeEach(() => {
        window.scrollTo(0, 0);
    });

    router.afterEach(() => {});
    router.redirect({'*': "/"});
    router.start(App, '#app');
    window.Loading.hide();
}

window.ciphertext = 'bacanews';
let token = Cookies.get('token');
if(token){
	window.logined = true;
    window.userData = decryptCode(token);
    Util.getRights(2 ,function(k){
    	window.sysPermisstion = k;
        start();
    })
}else{
	window.logined = false;
	start();
}

