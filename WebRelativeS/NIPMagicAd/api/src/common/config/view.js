'use strict';
/**
 * template config
 */
export default {
  type: 'ejs',
  content_type: 'text/html',
  file_ext: '.html',
  file_depr: '_',
  root_path: think.ROOT_PATH + '/view',
  adapter: {
    nunjucks: {
      trimBlocks: false, //不转义
      prerender: function(nunjucks, env){ //针对nunjucks模板的过滤器
          // console.log('prerender' ,nunjucks ,env);
      } 
    }
  }
};