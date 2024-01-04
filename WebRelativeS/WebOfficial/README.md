## nodejs 服务器框架

> 基于typescript 以及egg 规范开发。

1. 业务代码全部在app文件夹内，基于阿里规范router -> controller -> service，流程解决业务相关，`this.ctx`下有相关请求和返回内容，线程处理有nodejs 和 egg 解决

2. store 可连接远程azure/store，在store文件夹内，未指定container, 通过函数参数指定container

3. public 下为静态文件，多用于渲染页面使用的统一样式和类库，html 内通过"/public/*"，引用

4. view 为视图相关，使用ejs 模板渲染基页面，通过`this.ctx.render`方法实现渲染对应页面

5. 项目相关配置在 `/config/config.default.ts`文件内,业务相关配置在`/app/config`下

6. 第三方插件请在 `/config/plugin.ts`文件内注册