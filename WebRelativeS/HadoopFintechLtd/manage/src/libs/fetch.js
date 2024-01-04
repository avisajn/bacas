import superagentRequest from 'superagent';
import Store from './store.js';
import Cookies from 'js-cookie';

// http://idcrawler.vm.newsinpalm.net/permission/api/user?key=
let baseUrl = 'http://idcrawler.vm.newsinpalm.net/hadoop/api';
if(window.location.origin.indexOf('8080') > 0) baseUrl = 'http://localhost:8360/hfoy';

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  return new Promise(function(resolve, reject) { 
    if(url.indexOf('http') < 0) url = baseUrl + url;

    const config = Object.assign({}, {
      method : 'get',
      url : '',
      body:{},
    }, options);



    const param = config.body;
    let req = superagentRequest;

    if (config.method === 'get') req = req.get(url);
    else if (config.method === 'post') req = req.post(url);
    else if (config.method === 'put') req = req.put(url);
    else if (config.method === 'delete') req = req.delete(url);

    if (config.method === 'get') {
        if (config.paramFilter) req = req.query(JSON.stringify(param))
        else req = req.query(param);
    } else {
        if (param) req = req.send(param);
    }


    req.withCredentials(true);

    req.header['X-Requested-With'] = 'XMLHttpRequest';
    window.ajaxReq = req;
    req.end(function (err, res , d) {
      if (err) {  // 出错，则全部跳转到没有权限，没有登录
        window.ajaxReq.abort();
        console.error('请求接口：' + url + '时，遇到了问题1:')
        reject({ err:err.toString() })
        return
      }
      if (res.error) {
        console.error('请求接口：' + url + '时，遇到了问题2:')
        reject({ err:res.text })
        return
      }
      let data = null;
      if(res.text){
        data = JSON.parse(res.text);
        // -99 : 未登录
        // -98 : 已过期
        if(data.errno == '-99'){
          console.log('fetch:-99,',url);
          window.location.href = '#!/login';
          return ;
        }
        if(data.errno == '-98'){
          Cookies.remove('hadoop_token');
          alert('登录信息已经过期了，请重新登录！');
          window.location.href = '#!/login';
          return ;
        }
        if (data.errno < 0) {
          console.error('请求接口：' + url + '时，遇到了问题3:')
          reject({ err:data.errmsg, errno:data.errno ,data:data.data })
          return
        }
      }
      window.ajaxReq = null;
      if(data.data) return resolve(data.data);
      resolve(data);
    });
    
  });
}
