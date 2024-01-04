import superagentRequest from 'superagent';
import Store from './store.js';

let baseUrl = 'http://192.168.1.52:8989/dashboard/api';

let _config = {
  method : 'get',
  url : '',
  body:{},
  withCredentials : true
}
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  if(url.indexOf('http://') < 0 ){
      let country = Store.get('language');
      if(!country){
        const winCountry = window.country;
        if(winCountry){
          if(winCountry.indexOf(',') > 0){
            country = winCountry.split(',')[0];
          }else{
            country = winCountry;
          }
        }else{
          alert('Login information has expired');
          return;
        }
      }
      // baseUrl = 'http://idcrawler.vm.newsinpalm.net/cmsboard/'+country;
      // baseUrl = 'http://idcrawler.vm.newsinpalm.net/cmsboard';
      baseUrl = 'http://idcrawler.vm.newsinpalm.net/dashboard/api/'+country;
      url = baseUrl + url;
  }
  return new Promise(function(resolve, reject) { 
    
    let config = Object.assign({}, _config, options);
    let param = config.body;
    let req = superagentRequest;


    if (config.method === 'get') {
      req = req.get(url)
    } else if (config.method === 'post') {
      req = req.post(url)
    } else if (config.method === 'put') {
      req = req.put(url)
    } else if (config.method === 'delete') {
      req = req.delete(url)
    }

    if (config.method === 'get') {
            // 参数
        if (config.paramFilter) {
          req = req.query(JSON.stringify(param))
        } else {
          req = req.query(param)
        }
    } else {
        if (param ) {
          req = req.send(param)
        }
    }
    // req = req.timeout({
      // response: 5 * 60 * 1000,  // Wait 5 seconds for the server to start sending,
      // deadline: 5 * 60 * 1000, // but allow 1 minute for the file to finish loading.
    // });

    if(config.attach){
      req = req.set('enctype', 'multipart/form-data');
    }else{
      req = req.type('form');
    }


    if(config.withCredentials){
      req = req.withCredentials(true);
    }
    req.end(function (err, res , d) {
      if (err) {  // 出错，则全部跳转到没有权限，没有登录
        // window.ajaxReq.abort();
        req.abort();
        console.error('请求接口：' + url + '时，遇到了问题1:')
        reject({ err:err.toString() })
        return
      }
      if (res.error) {
        req.abort();
        console.error('请求接口：' + url + '时，遇到了问题2:')
        reject({ err:res.text })
        return
      }
      let data = "";
      if(res.text){
        data = res.text;
        data = JSON.parse(data);

        // -99 : 未登录
        // -98 : 已过期
        if(data.errid == '-99'){
          req.abort();
          console.log('fetch:-99,',url);
          return ;
        }
        if(data.errid == '-98'){
          req.abort();
          alert('登录信息已经过期了，请重新登录！');
          return ;
        }
        if (data.errid < 0) {
          req.abort();
          console.error('请求接口：' + url + '时，遇到了问题3:')
          reject({ err:data.errmsg, errno:data.errid ,data:data.data })
          return
        }
      }
      // window.ajaxReq = null;
      if(data.data && !config.allData){
        resolve(data.data);
      }else{
        resolve(data);
      }
    });
  });
}
