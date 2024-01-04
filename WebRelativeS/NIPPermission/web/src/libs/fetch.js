import superagentRequest from 'superagent';
import Store from './store.js';
import Cookies from 'js-cookie';

let baseUrl = 'http://localhost:8360/api';
// baseUrl = 'http://pa.ymark.cc/api';
if(window.location.host.indexOf('idcrawler') >= 0) baseUrl = 'http://idcrawler.vm.newsinpalm.net/permission/api';
let _config = {
  method : 'get',
  url : '',
  body:{},
}
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  return new Promise(function(resolve, reject) { 
    // if(window.ajaxReq){
    //   window.ajaxReq.abort();
    // }
    url = baseUrl + url;
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
        if (param) {
          req = req.send(param)
        }
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
      let data = "";
      if(res.text){
        data = res.text;
        data = JSON.parse(data);

        // -99 : 未登录
        // -98 : 已过期
        if(data.errno == '-99'){
          console.log('fetch:-99,',url);
          Cookies.remove('token');
          window.location.reload();
          window.location.href = '#!/login';
          return ;
        }
        if(data.errno == '-98'){
          Cookies.remove('token');
          alert('登录信息已经过期了，请重新登录！');
          window.location.href = '#!/login';
          window.location.reload();
          return ;
        }
        if (data.errno < 0) {
          console.error('请求接口：' + url + '时，遇到了问题3:')
          reject({ err:data.errmsg, errno:data.errno ,data:data.data })
          return
        }
      }
      window.ajaxReq = null;
      resolve(data.data);
    });
    
  });
}
